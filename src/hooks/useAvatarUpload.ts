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
        try {
          const { data: { session } } = await supabase.auth.getSession();
          activeUserId = session?.user?.id || null;
        } catch {
          activeUserId = null;
        }
      }

      // 3. Upload to Supabase Storage 'avatars' bucket with 4000ms safety timeout
      let resolvedPublicUrl: string | null = null;
      try {
        const fileName = `${activeUserId || 'user'}_${Date.now()}.jpg`;
        const uploadPromise = supabase.storage
          .from('avatars')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/jpeg',
          });

        const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error('Upload timeout fallback') }), 4000)
        );

        const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

        if (!uploadError && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          if (publicUrl) {
            resolvedPublicUrl = publicUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('[useAvatarUpload] Storage upload warning, using local dataUrl:', uploadErr);
      }

      const finalUrl = resolvedPublicUrl || dataUrl;
      options?.onSuccess?.(finalUrl, dataUrl);
      return { publicUrl: resolvedPublicUrl, dataUrl };
    } catch (err: any) {
      console.warn('[useAvatarUpload] Error in uploadAvatar:', err);
      // Fallback: Read file directly as DataURL if compression had an issue
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fallbackDataUrl = e.target?.result as string;
          if (fallbackDataUrl) {
            setAvatarPreview(fallbackDataUrl);
            options?.onSuccess?.(fallbackDataUrl, fallbackDataUrl);
          }
        };
        reader.readAsDataURL(file);
      } catch {}
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
