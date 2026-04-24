import { useNavigate } from 'react-router-dom';
import type { Item } from '@shared/types';
import { Badge } from '@/components/common/Badge';
import { t } from '@/locales';
import { formatRelativeTime } from '@/lib/utils';
import styles from './ItemCard.module.css';

interface Props {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemCard({ item, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  function goView() {
    navigate(`/view/${item.id}`);
  }

  return (
    <div
      className={styles.card}
      onClick={goView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') goView();
      }}
      role="button"
      tabIndex={0}
      aria-label={item.title}
    >
      <div className={styles.thumb}>
        <img src={`/thumbs/${item.thumbnail.filename}`} alt={item.title} loading="lazy" />
        {item.depth && (
          <div className={styles.badge}>
            <Badge color="accent">{t.home.cardDepthBadge}</Badge>
          </div>
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title={t.home.cardEditTooltip}
            aria-label={t.home.cardEditTooltip}
          >
            ✏️
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title={t.home.cardDeleteTooltip}
            aria-label={t.home.cardDeleteTooltip}
          >
            🗑
          </button>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{item.title}</div>
        {item.tags.length > 0 && (
          <div className={styles.tags}>
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && <span className={styles.tag}>+{item.tags.length - 3}</span>}
          </div>
        )}
        <div className={styles.meta}>
          <span>{formatRelativeTime(new Date(item.createdAt))}</span>
        </div>
      </div>
    </div>
  );
}
