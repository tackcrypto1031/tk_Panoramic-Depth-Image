import fs from 'node:fs';
import path from 'node:path';

export default async function () {
  const dir = path.resolve('.e2e-data');
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const d of ['uploads', 'thumbs', '.trash', '.tmp', 'logs']) {
    fs.mkdirSync(path.join(dir, d), { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'items.json'), JSON.stringify({ version: 1, items: [] }));
}
