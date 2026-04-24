import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore } from './store';
import { api } from './api';

vi.mock('./api', () => ({
  api: {
    listItems: vi.fn(),
    getItem: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  },
}));

const mockApi = api as unknown as {
  listItems: ReturnType<typeof vi.fn>;
  updateItem: ReturnType<typeof vi.fn>;
  deleteItem: ReturnType<typeof vi.fn>;
};

describe('store', () => {
  beforeEach(() => {
    useAppStore.setState({ items: [], itemsStatus: 'idle' });
    vi.clearAllMocks();
  });

  it('fetchItems populates store', async () => {
    mockApi.listItems.mockResolvedValue([{ id: 'a' }]);
    await useAppStore.getState().fetchItems();
    expect(useAppStore.getState().items).toHaveLength(1);
    expect(useAppStore.getState().itemsStatus).toBe('idle');
  });

  it('fetchItems sets error status on failure', async () => {
    mockApi.listItems.mockRejectedValue(new Error('boom'));
    await useAppStore.getState().fetchItems();
    expect(useAppStore.getState().itemsStatus).toBe('error');
  });

  it('updateItem replaces item in place', async () => {
    useAppStore.setState({ items: [{ id: 'a', title: 'old' } as never] });
    mockApi.updateItem.mockResolvedValue({ id: 'a', title: 'new' });
    await useAppStore.getState().updateItem('a', { title: 'new' });
    expect(useAppStore.getState().items[0]!.title).toBe('new');
  });

  it('deleteItem removes from list', async () => {
    useAppStore.setState({ items: [{ id: 'a' } as never, { id: 'b' } as never] });
    mockApi.deleteItem.mockResolvedValue(undefined);
    await useAppStore.getState().deleteItem('a');
    expect(useAppStore.getState().items).toHaveLength(1);
    expect(useAppStore.getState().items[0]!.id).toBe('b');
  });
});
