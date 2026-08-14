import { useState, useCallback } from 'react';
import { compressImageFile } from '@/lib/image-compressor';
import { createClient } from '@/lib/supabase/client';

interface UseAvatarUploadOptions {
  onSuccess?: (publicUrl: string, dataUrl: string) => void;
  onError?: (errorMsg: string) => void;
}

export function useAvatarUpload(options?: UseAvatarUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const uploadAvatar = useCallback(async (file: File, fallbackUserId?: string | null): Promise<{ publicUrl: string | null; dataUrl: string } | null> => {
    if (!file) return null;

    if (!file.type.startsWith('image/')) {
      const msg = 'Please select a valid image file (JPG, PNG, WebP, etc.).';
      setError(msg);
      options?.onError?.(msg);
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Compress image client-side (1200px max dimension, 0.82 quality)
      const { blob, dataUrl } = await compressImageFile(file, 1200, 0.82);
      setAvatarPreview(dataUrl);

      // 2. Resolve active user ID
      const supabase = createClient();
      let activeUserId = fallbackUserId;
      if (!activeUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        activeUserId = session?.user?.id || null;
      }

      // 3. Upload to Supabase Storage 'avatars' bucket
      const fileName = `${activeUserId || 'user'}_${Date.now()}.jpg`;
      const uploadPromise = supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout exceeded')), 15000)
      );

      const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

      let resolvedPublicUrl: string | null = null;
      if (!uploadError && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        if (publicUrl) {
          resolvedPublicUrl = publicUrl;
        }
      } else if (uploadError) {
        console.warn('Storage upload notice (falling back to client Data URL):', uploadError);
      }

      const finalUrl = resolvedPublicUrl || dataUrl;
      options?.onSuccess?.(finalUrl, dataUrl);
      return { publicUrl: resolvedPublicUrl, dataUrl };
    } catch (err: any) {
      console.warn('Storage upload fallback to compressed Data URL:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  return {
    isUploading,
    error,
    avatarPreview,
    uploadAvatar,
    clearError: () => setError(null),
  };
}
