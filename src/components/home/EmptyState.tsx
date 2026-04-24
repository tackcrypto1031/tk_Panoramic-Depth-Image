import { Button } from '@/components/common/Button';
import { t } from '@/locales';

interface Props {
  onNew: () => void;
}

export function EmptyState({ onNew }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        gap: 16,
        color: 'var(--text-secondary)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 64, opacity: 0.4 }}>🌐</div>
      <h2 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>
        {t.home.emptyTitle}
      </h2>
      <p style={{ margin: 0, maxWidth: 400 }}>{t.home.emptyDesc}</p>
      <Button variant="primary" size="lg" onClick={onNew}>
        {t.home.emptyButton}
      </Button>
    </div>
  );
}
