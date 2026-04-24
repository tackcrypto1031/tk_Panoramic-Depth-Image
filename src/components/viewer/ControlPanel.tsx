import { useState } from 'react';
import type { ViewerSettings } from '@shared/types';
import { LIMITS } from '@shared/types';
import { Slider } from '@/components/common/Slider';
import { Toggle } from '@/components/common/Toggle';
import { Button } from '@/components/common/Button';
import { t } from '@/locales';
import styles from './ControlPanel.module.css';

interface Props {
  settings: ViewerSettings;
  onChange: (patch: Partial<ViewerSettings>) => void;
  onSave: () => void;
  onReset: () => void;
  hasDepth: boolean;
  saving: boolean;
}

export function ControlPanel({ settings, onChange, onSave, onReset, hasDepth, saving }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className={styles.wrap}>
      {open && (
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <Slider
            label={t.viewer.controls.depthScale}
            value={settings.depthScale}
            min={0}
            max={1}
            step={0.01}
            disabled={!hasDepth}
            disabledHint={t.viewer.controls.needDepth}
            onChange={(v) => onChange({ depthScale: v })}
          />
          <Toggle
            label={t.viewer.controls.invertDepth}
            checked={settings.invertDepth}
            disabled={!hasDepth}
            onChange={(v) => onChange({ invertDepth: v })}
          />
          <Slider
            label={t.viewer.controls.parallax}
            value={settings.parallaxAmount}
            min={0}
            max={1}
            step={0.01}
            disabled={!hasDepth}
            disabledHint={t.viewer.controls.needDepth}
            onChange={(v) => onChange({ parallaxAmount: v })}
          />
          <Slider
            label={t.viewer.controls.fov}
            value={settings.fov}
            min={LIMITS.fovMin}
            max={LIMITS.fovMax}
            step={1}
            format={(v) => `${v.toFixed(0)}°`}
            onChange={(v) => onChange({ fov: v })}
          />
          <Toggle
            label={t.viewer.controls.autoRotate}
            checked={settings.autoRotate}
            onChange={(v) => onChange({ autoRotate: v })}
          />
          <Slider
            label={t.viewer.controls.autoRotateSpeed}
            value={settings.autoRotateSpeed}
            min={LIMITS.autoRotateSpeedMin}
            max={LIMITS.autoRotateSpeedMax}
            step={0.1}
            disabled={!settings.autoRotate}
            onChange={(v) => onChange({ autoRotateSpeed: v })}
          />
          <div className={styles.divider} />
          <div className={styles.footer}>
            <Button variant="ghost" size="sm" onClick={onReset}>
              {t.viewer.controls.reset}
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
              {t.viewer.controls.save}
            </Button>
          </div>
        </div>
      )}
      <button
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-label="toggle controls"
      >
        {open ? '✕' : '⚙'}
      </button>
    </div>
  );
}
