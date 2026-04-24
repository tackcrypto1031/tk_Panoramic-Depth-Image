import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  preview?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
  warning?: string;
}

export function Dropzone({ label, hint, accept, file, preview, onChange, error, warning }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) onChange(f);
        }}
        className={cn()}
        style={{
          border: `2px dashed ${error ? 'var(--danger)' : dragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: 16,
          minHeight: 120,
          cursor: 'pointer',
          textAlign: 'center',
          background: dragging ? 'var(--accent-muted)' : 'var(--bg-elevated)',
          transition: 'all 0.15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {preview ? (
          <img src={preview} alt="" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 4 }} />
        ) : (
          <div style={{ fontSize: 24, opacity: 0.5 }}>📁</div>
        )}
        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
          {file ? file.name : '拖放或點擊選取'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 4 }}>{error}</div>}
      {warning && !error && (
        <div style={{ color: 'var(--warning)', fontSize: 11, marginTop: 4 }}>{warning}</div>
      )}
    </div>
  );
}
