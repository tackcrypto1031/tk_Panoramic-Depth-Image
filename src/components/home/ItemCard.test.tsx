import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ItemCard } from './ItemCard';
import type { Item } from '@shared/types';
import { DEFAULT_VIEWER_SETTINGS } from '@shared/types';

function makeItem(overrides: Partial<Item> = {}): Item {
  const now = new Date().toISOString();
  return {
    id: 'abc',
    title: 'Hello',
    tags: ['alpha', 'beta', 'gamma', 'delta'],
    createdAt: now,
    updatedAt: now,
    panorama: { filename: 'panorama.jpg', width: 4096, height: 2048, mimeType: 'image/jpeg' },
    depth: null,
    thumbnail: { filename: 'abc.webp', width: 480, height: 240 },
    viewerSettings: { ...DEFAULT_VIEWER_SETTINGS },
    ...overrides,
  };
}

describe('ItemCard', () => {
  it('renders title, tags (first 3 + more), and no 3D badge when no depth', () => {
    render(
      <MemoryRouter>
        <ItemCard item={makeItem()} onEdit={() => {}} onDelete={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.queryByText('3D')).toBeNull();
  });

  it('shows 3D badge when depth present', () => {
    const item = makeItem({
      depth: { filename: 'depth.png', width: 4096, height: 2048, mimeType: 'image/png' },
    });
    render(
      <MemoryRouter>
        <ItemCard item={item} onEdit={() => {}} onDelete={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText('3D')).toBeInTheDocument();
  });

  it('onEdit/onDelete do not navigate', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ItemCard item={makeItem()} onEdit={onEdit} onDelete={onDelete} />
      </MemoryRouter>
    );
    await user.click(screen.getByLabelText('編輯'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    await user.click(screen.getByLabelText('刪除'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
