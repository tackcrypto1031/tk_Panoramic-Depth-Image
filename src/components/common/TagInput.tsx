import { useState, type KeyboardEvent } from 'react';
import { LIMITS } from '@shared/types';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: Props) {
  const [draft, setDraft] = useState('');
  const atMax = value.length >= LIMITS.tagsMaxCount;

  function commit() {
    const t = draft.trim();
    if (!t || t.length > LIMITS.tagMaxLen) {
      setDraft('');
      return;
    }
    if (value.includes(t)) {
      setDraft('');
      return;
    }
    if (atMax) return;
    onChange([...value, t]);
    setDraft('');
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
        alignItems: 'center',
        padding: 6,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        background: 'var(--bg-elevated)',
      }}
    >
      {value.map((tag) => (
        <span
          key={tag}
          style={{
            background: 'var(--bg-card)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            style={{ color: 'var(--text-muted)', padding: 0, lineHeight: 1 }}
            aria-label={`移除 ${tag}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={atMax ? `已達上限 ${LIMITS.tagsMaxCount}` : placeholder}
        disabled={atMax}
        style={{ flex: 1, minWidth: 80, border: 'none', background: 'transparent', padding: 4 }}
        maxLength={LIMITS.tagMaxLen}
      />
    </div>
  );
}
