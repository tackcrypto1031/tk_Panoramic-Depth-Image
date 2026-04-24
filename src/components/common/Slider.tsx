interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  disabledHint?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  disabled,
  disabledHint,
  onChange,
  format,
}: Props) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
      }}
      title={disabled ? disabledHint : undefined}
    >
      <span
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {format ? format(value) : value.toFixed(2)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
    </label>
  );
}
