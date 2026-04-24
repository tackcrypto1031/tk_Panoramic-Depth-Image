import type { Item, ApiError } from '@shared/types';

class ApiClientError extends Error {
  constructor(
    public status: number,
    public body: ApiError
  ) {
    super(body.error.message);
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
  const body = (await res.json().catch(() => ({
    error: { code: 'INTERNAL', message: `HTTP ${res.status}` },
  }))) as ApiError;
  throw new ApiClientError(res.status, body);
}

export const api = {
  async listItems(): Promise<Item[]> {
    return handle(await fetch('/api/items'));
  },
  async getItem(id: string): Promise<Item> {
    return handle(await fetch(`/api/items/${id}`));
  },
  async createItem(form: FormData, onProgress?: (pct: number) => void): Promise<Item> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/items');
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(e);
          }
        } else {
          let body: ApiError;
          try {
            body = JSON.parse(xhr.responseText);
          } catch {
            body = { error: { code: 'INTERNAL', message: `HTTP ${xhr.status}` } };
          }
          reject(new ApiClientError(xhr.status, body));
        }
      };
      xhr.onerror = () =>
        reject(new ApiClientError(0, { error: { code: 'INTERNAL', message: 'Network error' } }));
      xhr.send(form);
    });
  },
  async updateItem(
    id: string,
    patch: Partial<Pick<Item, 'title' | 'tags' | 'viewerSettings'>>
  ): Promise<Item> {
    return handle(
      await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
    );
  },
  async deleteItem(id: string): Promise<void> {
    return handle(await fetch(`/api/items/${id}`, { method: 'DELETE' }));
  },
};

export { ApiClientError };
