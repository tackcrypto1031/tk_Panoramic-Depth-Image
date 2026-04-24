import { create } from 'zustand';
import type { Item, ItemId } from '@shared/types';
import { api } from './api';

interface AppState {
  items: Item[];
  itemsStatus: 'idle' | 'loading' | 'error';
  fetchItems(): Promise<void>;
  createItem(form: FormData, onProgress?: (pct: number) => void): Promise<Item>;
  updateItem(
    id: ItemId,
    patch: Partial<Pick<Item, 'title' | 'tags' | 'viewerSettings'>>
  ): Promise<Item>;
  deleteItem(id: ItemId): Promise<void>;
  getItem(id: ItemId): Item | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  items: [],
  itemsStatus: 'idle',

  async fetchItems() {
    set({ itemsStatus: 'loading' });
    try {
      const items = await api.listItems();
      set({ items, itemsStatus: 'idle' });
    } catch {
      set({ itemsStatus: 'error' });
    }
  },

  async createItem(form, onProgress) {
    const item = await api.createItem(form, onProgress);
    set({ items: [item, ...get().items] });
    return item;
  },

  async updateItem(id, patch) {
    const updated = await api.updateItem(id, patch);
    set({
      items: get().items.map((i) => (i.id === id ? updated : i)),
    });
    return updated;
  },

  async deleteItem(id) {
    await api.deleteItem(id);
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  getItem(id) {
    return get().items.find((i) => i.id === id);
  },
}));
