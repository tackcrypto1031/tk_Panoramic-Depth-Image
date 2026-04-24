import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { TagInput } from '@/components/common/TagInput';
import { Dropzone } from '@/components/common/Dropzone';
import { Spinner } from '@/components/common/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAppStore } from '@/lib/store';
import { renderThumbnail } from '@/lib/thumbnail';
import { t } from '@/locales';
import { LIMITS } from '@shared/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ImgInfo {
  width: number;
  height: number;
  url: string;
}

function getImageInfo(file: File): Promise<ImgInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片解碼失敗'));
    };
    img.src = url;
  });
}

export function UploadModal({ open, onClose }: Props) {
  const createItem = useAppStore((s) => s.createItem);

  const [panorama, setPanorama] = useState<File | null>(null);
  const [depth, setDepth] = useState<File | null>(null);
  const [panoInfo, setPanoInfo] = useState<ImgInfo | null>(null);
  const [depthInfo, setDepthInfo] = useState<ImgInfo | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    if (!open) {
      setPanorama(null);
      setDepth(null);
      setPanoInfo(null);
      setDepthInfo(null);
      setTitle('');
      setTags([]);
      setSubmitting(false);
      setProgress(0);
    }
  }, [open]);

  useEffect(() => {
    if (!panorama) {
      setPanoInfo(null);
      return;
    }
    let stale = false;
    getImageInfo(panorama)
      .then((info) => {
        if (!stale) {
          setPanoInfo(info);
          if (!title) setTitle(panorama.name.replace(/\.[^.]+$/, ''));
        }
      })
      .catch((e) => toast.error((e as Error).message));
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panorama]);

  useEffect(() => {
    if (!depth) {
      setDepthInfo(null);
      return;
    }
    let stale = false;
    getImageInfo(depth)
      .then((info) => {
        if (!stale) setDepthInfo(info);
      })
      .catch(() => undefined);
    return () => {
      stale = true;
    };
  }, [depth]);

  const ratio = panoInfo ? panoInfo.width / panoInfo.height : 0;
  const ratioOk = ratio >= LIMITS.ratioMin && ratio <= LIMITS.ratioMax;
  const panoError = panoInfo && !ratioOk ? t.upload.ratioWarning(ratio) : undefined;
  const panoSizeError =
    panorama && panorama.size > LIMITS.fileMaxBytes ? t.upload.errors.fileTooLarge : undefined;
  const depthSizeError =
    depth && depth.size > LIMITS.fileMaxBytes ? t.upload.errors.fileTooLarge : undefined;
  const depthWarn =
    depthInfo &&
    panoInfo &&
    (depthInfo.width !== panoInfo.width || depthInfo.height !== panoInfo.height)
      ? t.upload.depthResizeHint(panoInfo.width, panoInfo.height)
      : undefined;

  const canSubmit =
    panorama &&
    ratioOk &&
    !panoSizeError &&
    !depthSizeError &&
    title.trim().length > 0 &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit || !panorama) return;
    setSubmitting(true);
    setProgress(0);
    try {
      const thumbBlob = await renderThumbnail(panorama, depth);
      const form = new FormData();
      form.append('title', title.trim());
      form.append('tags', JSON.stringify(tags));
      form.append('panorama', panorama);
      if (depth) form.append('depth', depth);
      form.append('thumbnail', new File([thumbBlob], 'thumbnail.webp', { type: 'image/webp' }));

      await createItem(form, (p) => setProgress(p));
      toast.success('上傳完成');
      onClose();
    } catch (e) {
      toast.error((e as Error).message || t.upload.errors.network);
    } finally {
      setSubmitting(false);
    }
  }

  function requestClose() {
    if (!submitting && (panorama || depth || title || tags.length > 0)) {
      setCancelConfirm(true);
    } else {
      onClose();
    }
  }

  return (
    <>
      <Modal
        open={open && !cancelConfirm}
        title={t.upload.title}
        onClose={requestClose}
        closeOnBackdrop={!submitting}
        footer={
          <>
            <Button variant="ghost" onClick={requestClose} disabled={submitting}>
              {t.upload.cancel}
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? (
                <>
                  <Spinner size={14} /> {t.upload.submitting}{' '}
                  {progress > 0 && `${Math.round(progress)}%`}
                </>
              ) : (
                t.upload.submit
              )}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 480 }}>
          <Dropzone
            label={t.upload.panoramaLabel}
            hint={t.upload.panoramaHint}
            accept="image/jpeg,image/png,image/webp"
            file={panorama}
            preview={panoInfo?.url ?? null}
            onChange={setPanorama}
            error={panoError || panoSizeError}
          />
          <Dropzone
            label={t.upload.depthLabel}
            hint={t.upload.depthHint}
            accept="image/png,image/jpeg,image/webp"
            file={depth}
            preview={depthInfo?.url ?? null}
            onChange={setDepth}
            error={depthSizeError}
            warning={depthWarn}
          />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {t.upload.titleField}
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={LIMITS.titleMaxLen}
              disabled={submitting}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {t.upload.tagsField}
            </span>
            <TagInput value={tags} onChange={setTags} placeholder={t.upload.tagsHint} />
          </label>
          {submitting && progress > 0 && (
            <div
              style={{
                height: 4,
                background: 'var(--bg-elevated)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  transition: 'width 0.15s',
                }}
              />
            </div>
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={cancelConfirm}
        title={t.upload.cancel}
        message={t.upload.cancelConfirm}
        onConfirm={() => {
          setCancelConfirm(false);
          onClose();
        }}
        onCancel={() => setCancelConfirm(false)}
      />
    </>
  );
}
