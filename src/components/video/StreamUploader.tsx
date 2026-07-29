'use client';

import React, { useState } from 'react';
import { Upload, Video, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface StreamUploaderProps {
  target?: 'platform_content' | 'profile';
  tier?: 'vip' | 'master';
  title?: string;
  description?: string;
  onUploadComplete?: (data: { uid: string; contentId?: string; isMock?: boolean }) => void;
  className?: string;
}

export const StreamUploader: React.FC<StreamUploaderProps> = ({
  target = 'platform_content',
  tier = 'vip',
  title = 'New Exclusive Video',
  description = '',
  onUploadComplete,
  className = '',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith('video/')) {
        setError('Please select a valid video file (MP4, MOV, WebM, etc.).');
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const startUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(5);
    setStatusText('Initiating secure video upload...');
    setError(null);

    try {
      // 1. Request direct upload URL from backend
      const res = await fetch('/api/stream/direct-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target,
          tier,
          title,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to authorize video upload.');
      }

      const { uploadUrl, uid, contentId, isMock } = data;

      if (isMock) {
        // Simulated progress for mock environment
        for (let p = 10; p <= 100; p += 20) {
          setProgress(p);
          setStatusText(`Simulating upload... ${p}%`);
          await new Promise((r) => setTimeout(r, 300));
        }
        setIsSuccess(true);
        setUploading(false);
        if (onUploadComplete) onUploadComplete({ uid, contentId, isMock: true });
        return;
      }

      // 2. Perform direct upload to Cloudflare Stream
      setStatusText('Uploading video directly to Cloudflare Stream...');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 90); // Save last 10% for processing handover
          setProgress(percent);
          setStatusText(`Uploading... ${percent}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          setStatusText('Upload complete! Video processing & encoding started.');
          setIsSuccess(true);
          setUploading(false);
          if (onUploadComplete) onUploadComplete({ uid, contentId });
        } else {
          setError(`Upload failed with status ${xhr.status}`);
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        setError('Network error during video stream upload.');
        setUploading(false);
      };

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'An unexpected error occurred during upload.');
      setUploading(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-xl transition-all ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-white font-semibold text-base">Cloudflare Stream Uploader</h4>
          <p className="text-xs text-zinc-400">Direct chunked upload with adaptive HLS encoding</p>
        </div>
      </div>

      {!isSuccess ? (
        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 hover:border-pink-500/50 rounded-xl cursor-pointer bg-zinc-950/40 hover:bg-zinc-950/80 transition group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Video className="w-10 h-10 mb-2 text-zinc-400 group-hover:text-pink-400 group-hover:scale-110 transition" />
              <p className="mb-1 text-sm text-zinc-300">
                <span className="font-semibold text-pink-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-zinc-500">MP4, MOV, WebM (Auto-transcoded to HLS)</p>
            </div>
            <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
          </label>

          {file && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-white/5 text-xs text-zinc-300">
              <span className="truncate max-w-[200px] font-medium">{file.name}</span>
              <span className="text-zinc-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={startUpload}
            disabled={!file || uploading}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Upload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Stream Video
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h5 className="text-white font-semibold text-sm">Upload Successful</h5>
          <p className="text-xs text-zinc-400">
            Your video is now being processed by Cloudflare Stream. It will be published as soon as encoding completes.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              setFile(null);
            }}
            className="mt-2 text-xs text-pink-400 hover:underline"
          >
            Upload another video
          </button>
        </div>
      )}
    </div>
  );
};
