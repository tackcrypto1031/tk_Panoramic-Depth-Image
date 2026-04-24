export function Badge({
  children,
  color = 'default',
}: {
  children: React.ReactNode;
  color?: 'default' | 'accent';
}) {
  const bg = color === 'accent' ? 'var(--accent-muted)' : 'var(--bg-elevated)';
  const fg = color === 'accent' ? '#93c5fd' : 'var(--text-secondary)';
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: fg,
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}
