import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { t } from '@/locales';
import type { Item } from '@shared/types';

export function ViewerHeader({ item }: { item: Item }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        padding: '8px 14px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <button
        onClick={() => navigate('/')}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
        }}
        aria-label={t.viewer.back}
      >
        ←
      </button>
      <span
        style={{
          fontWeight: 600,
          maxWidth: 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.title}
      </span>
      {item.depth && <Badge color="accent">3D</Badge>}
    </div>
  );
}
