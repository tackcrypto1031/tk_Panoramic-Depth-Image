import { useEffect, useState } from 'react';
import type { Item } from '@shared/types';
import { LIMITS } from '@shared/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { TagInput } from '@/components/common/TagInput';
import { useAppStore } from '@/lib/store';
import { t } from '@/locales';
import { toast } from 'sonner';

interface Props {
  item: Item | null;
  onClose: () => void;
}

export function EditItemModal({ item, onClose }: Props) {
  const updateItem = useAppStore((s) => s.updateItem);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setTags([...item.tags]);
    }
  }, [item]);

  if (!item) return null;

  const valid = title.trim().length > 0 && title.trim().length <= LIMITS.titleMaxLen;

  async function save() {
    if (!item || !valid) return;
    setSaving(true);
    try {
      await updateItem(item.id, { title: title.trim(), tags });
      toast.success(t.viewer.controls.saved);
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={!!item}
      title={t.edit.title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t.edit.cancel}
          </Button>
          <Button variant="primary" onClick={save} disabled={!valid || saving}>
            {t.edit.save}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {t.upload.titleField}
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={LIMITS.titleMaxLen}
            autoFocus
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.upload.tagsField}</span>
          <TagInput value={tags} onChange={setTags} placeholder={t.upload.tagsHint} />
        </label>
      </div>
    </Modal>
  );
}
