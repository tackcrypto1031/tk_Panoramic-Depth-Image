const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');
const subdirs = ['uploads', 'thumbs', '.trash', 'logs', '.tmp'];

fs.mkdirSync(dataDir, { recursive: true });
for (const d of subdirs) {
  fs.mkdirSync(path.join(dataDir, d), { recursive: true });
}

const itemsPath = path.join(dataDir, 'items.json');
if (!fs.existsSync(itemsPath)) {
  fs.writeFileSync(itemsPath, JSON.stringify({ version: 1, items: [] }, null, 2));
  console.log('已建立 data/items.json');
}
console.log('data 目錄初始化完成');
