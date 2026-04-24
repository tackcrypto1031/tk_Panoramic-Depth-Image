interface Props {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, checked, disabled, onChange }: Props) {
  return (
    <label
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 12,
        color: 'var(--text-secondary)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          position: 'relative',
          width: 36,
          height: 20,
          background: checked ? 'var(--accent)' : 'var(--bg-elevated)',
          borderRadius: 10,
          transition: 'background 0.15s',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', inset: 0, opacity: 0, margin: 0, cursor: 'inherit' }}
        />
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            background: '#fff',
            borderRadius: '50%',
            transition: 'left 0.15s',
          }}
        />
      </span>
    </label>
  );
}
