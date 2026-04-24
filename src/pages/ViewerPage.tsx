import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useWebGLCheck } from '@/hooks/useWebGLCheck';
import { Spinner } from '@/components/common/Spinner';
import { PanoramaScene } from '@/components/viewer/PanoramaScene';
import { ViewerHeader } from '@/components/viewer/ViewerHeader';
import { ControlPanel } from '@/components/viewer/ControlPanel';
import { ShortcutOverlay } from '@/components/viewer/ShortcutOverlay';
import { t } from '@/locales';
import type { Item, ViewerSettings } from '@shared/types';
import { toast } from 'sonner';

export default function ViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateItem = useAppStore((s) => s.updateItem);
  const webglOk = useWebGLCheck();

  const [item, setItem] = useState<Item | null>(null);
  const [settings, setSettings] = useState<ViewerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    api
      .getItem(id)
      .then((got) => {
        if (cancelled) return;
        setItem(got);
        setSettings({ ...got.viewerSettings });
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error(t.viewer.notFound);
        navigate('/', { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const updateSettings = useCallback((patch: Partial<ViewerSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const saveDefaults = useCallback(async () => {
    if (!item || !settings) return;
    setSaving(true);
    try {
      const updated = await updateItem(item.id, { viewerSettings: settings });
      setItem(updated);
      toast.success(t.viewer.controls.saved);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [item, settings, updateItem]);

  const resetDefaults = useCallback(() => {
    if (item) setSettings({ ...item.viewerSettings });
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'Escape':
          if (showShortcuts) setShowShortcuts(false);
          else navigate('/');
          break;
        case 'f':
        case 'F': {
          e.preventDefault();
          if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
          else document.exitFullscreen();
          break;
        }
        case ' ':
          e.preventDefault();
          setSettings((prev) => (prev ? { ...prev, autoRotate: !prev.autoRotate } : prev));
          break;
        case 'r':
        case 'R':
          resetDefaults();
          break;
        case '?':
          setShowShortcuts((v) => !v);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, resetDefaults, showShortcuts]);

  if (webglOk === false) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>{t.viewer.webglUnsupported}</p>
        <button onClick={() => navigate('/')}>{t.viewer.back}</button>
      </div>
    );
  }

  if (loading || !item || !settings) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <PanoramaScene
        item={item}
        settings={settings}
        onFovChange={(v) => updateSettings({ fov: v })}
      />
      <ViewerHeader item={item} />
      <ControlPanel
        settings={settings}
        onChange={updateSettings}
        onSave={saveDefaults}
        onReset={resetDefaults}
        hasDepth={!!item.depth}
        saving={saving}
      />
      <ShortcutOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
