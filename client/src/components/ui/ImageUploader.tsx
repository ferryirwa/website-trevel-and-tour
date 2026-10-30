import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/utils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = 'Image',
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB)');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post<{ url: string }>(
        '/admin/upload/image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      onChange(data.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const preview = value ? mediaUrl(value) : '';

  return (
    <div>
      {label && <label className="label">{label}</label>}

      {preview ? (
        <div className="relative inline-block">
          <div className="bg-neutral-light rounded-card p-3 border border-neutral-light">
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-auto object-contain max-w-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-neutral-light rounded-card p-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin text-primary" size={24} />
              <span className="text-sm text-neutral-mid">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="text-neutral-mid" size={24} />
              <span className="text-sm font-medium text-neutral-dark">
                Click to upload
              </span>
              <span className="text-xs text-neutral-mid">
                PNG, JPG, WebP · max 5MB
              </span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {hint && !error && <p className="text-xs text-neutral-mid mt-2">{hint}</p>}
      {error && <p className="text-xs text-error mt-2">{error}</p>}
    </div>
  );
}
