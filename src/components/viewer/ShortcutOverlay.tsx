import { t } from '@/locales';

export function ShortcutOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          minWidth: 320,
        }}
      >
        <h3 style={{ margin: '0 0 12px 0' }}>{t.shortcuts.title}</h3>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <li>{t.shortcuts.escBack}</li>
          <li>{t.shortcuts.fFullscreen}</li>
          <li>{t.shortcuts.spaceRotate}</li>
          <li>{t.shortcuts.rReset}</li>
          <li>{t.shortcuts.helpToggle}</li>
        </ul>
      </div>
    </div>
  );
}
