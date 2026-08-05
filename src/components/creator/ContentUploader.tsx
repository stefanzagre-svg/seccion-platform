'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, Video } from 'lucide-react';

interface ContentUploaderProps {
  onSuccess?: (uid: string) => void;
}

export default function ContentUploader({ onSuccess }: ContentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<'VIP' | 'MASTER'>('VIP');
  
  const [status, setStatus] = useState<'idle' | 'requesting_url' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('video/')) {
        setErrorMessage('Please select a valid video file.');
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }

    try {
      setStatus('requesting_url');
      setErrorMessage('');
      
      // 1. Get Direct Upload URL from our backend
      const res = await fetch('/api/v2/cloudflare/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, tier })
      });

      if (!res.ok) throw new Error('Failed to fetch secure upload URL');
      const { uploadURL, uid } = await res.json();

      setStatus('uploading');

      // 2. Upload directly to Cloudflare via XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadURL, true);

      // Create FormData to append the file
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const { error: dbError } = await supabase.from('platform_content').insert({
                creator_id: userData.user.id,
                cloudflare_stream_uid: uid,
                content_type: 'video',
                required_level: tier === 'VIP' ? 'close' : 'friendly',
                status: 'pending'
              });
              
              if (dbError) {
                console.error('Error saving video to database:', dbError);
              }
            }
          } catch (err) {
            console.error('Failed to save record to Supabase:', err);
          }

          setStatus('success');
          setProgress(100);
          if (onSuccess) onSuccess(uid);
        } else {
          throw new Error('Cloudflare rejected the upload.');
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error during upload.');
      };

      xhr.send(formData);

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="bg-black/50 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden">
      <h2 className="text-xl font-bold text-white mb-6">Upload New Content</h2>

      <div className="space-y-6">
        {/* File Dropzone */}
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group"
          >
            <Upload className="w-10 h-10 text-white/30 group-hover:text-primary mb-4 transition-colors" />
            <p className="text-sm font-bold text-white mb-1">Click to select video</p>
            <p className="text-xs text-white/40">MP4, MOV, WebM up to 10GB</p>
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                <p className="text-xs text-white/50">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            {status === 'idle' && (
              <button onClick={() => setFile(null)} className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Metadata Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-white/60 tracking-wider mb-1 block">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={status !== 'idle'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition disabled:opacity-50" 
              placeholder="Give it a catchy title" 
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-white/60 tracking-wider mb-1 block">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={status !== 'idle'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-white/10 transition h-24 resize-none disabled:opacity-50" 
              placeholder="What's this video about?" 
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-white/60 tracking-wider mb-2 block">Content Tier</label>
            <div className="flex gap-4">
              <label className="flex-1 relative">
                <input 
                  type="radio" 
                  name="tier" 
                  value="VIP" 
                  checked={tier === 'VIP'} 
                  onChange={() => setTier('VIP')}
                  disabled={status !== 'idle'}
                  className="peer hidden" 
                />
                <div className="w-full p-4 border border-white/10 rounded-xl cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-500/10 transition text-center disabled:opacity-50">
                  <span className="font-bold text-sm text-white peer-checked:text-purple-400">VIP</span>
                </div>
              </label>
              <label className="flex-1 relative">
                <input 
                  type="radio" 
                  name="tier" 
                  value="MASTER" 
                  checked={tier === 'MASTER'} 
                  onChange={() => setTier('MASTER')}
                  disabled={status !== 'idle'}
                  className="peer hidden" 
                />
                <div className="w-full p-4 border border-white/10 rounded-xl cursor-pointer peer-checked:border-[#00fbfb] peer-checked:bg-[#00fbfb]/10 transition text-center disabled:opacity-50">
                  <span className="font-bold text-sm text-white peer-checked:text-[#00fbfb]">MASTER</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Error State */}
        {status === 'error' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Progress & Actions */}
        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-white/80 uppercase tracking-wider">
              <span>Uploading to Cloudflare Edge</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 text-green-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            Upload Complete! Processing video...
          </div>
        )}

        {status === 'idle' && (
          <button 
            onClick={handleUpload}
            disabled={!file}
            className="w-full py-4 bg-primary text-black font-black uppercase text-sm rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 disabled:hover:shadow-none"
          >
            Upload Directly to Stream
          </button>
        )}
      </div>
    </div>
  );
}
