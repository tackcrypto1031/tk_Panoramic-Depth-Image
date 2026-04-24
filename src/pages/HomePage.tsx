import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { matchesSearch } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Spinner } from '@/components/common/Spinner';
import { ItemCard } from '@/components/home/ItemCard';
import { SearchBar } from '@/components/home/SearchBar';
import { EmptyState } from '@/components/home/EmptyState';
import { EditItemModal } from '@/components/home/EditItemModal';
import { UploadModal } from '@/components/home/UploadModal';
import { t } from '@/locales';
import type { Item } from '@shared/types';
import { toast } from 'sonner';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { items, itemsStatus, fetchItems, deleteItem } = useAppStore();
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = useMemo(
    () => items.filter((i) => matchesSearch(query, i.title, i.tags)),
    [items, query]
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteItem(target.id);
      toast.success('已刪除');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>{t.app.title}</div>
        <div className={styles.headerRight}>
          <SearchBar value={query} onChange={setQuery} />
          <Button variant="primary" onClick={() => setUploadOpen(true)}>
            {t.home.newItem}
          </Button>
        </div>
      </header>
      <main className={styles.main}>
        {itemsStatus === 'loading' && items.length === 0 && (
          <div className={styles.loading}>
            <Spinner size={24} />
          </div>
        )}
        {itemsStatus !== 'loading' && items.length === 0 && (
          <EmptyState onNew={() => setUploadOpen(true)} />
        )}
        {items.length > 0 && filtered.length === 0 && (
          <div className={styles.noResult}>{t.home.searchNoResult(query)}</div>
        )}
        {filtered.length > 0 && (
          <div className={styles.grid}>
            {filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => setEditItem(item)}
                onDelete={() => setDeleteTarget(item)}
              />
            ))}
          </div>
        )}
      </main>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <EditItemModal item={editItem} onClose={() => setEditItem(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        title={t.common.delete}
        message={deleteTarget ? t.home.confirmDelete(deleteTarget.title) : ''}
        confirmLabel={t.home.confirmDeleteOk}
        cancelLabel={t.home.confirmDeleteCancel}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
