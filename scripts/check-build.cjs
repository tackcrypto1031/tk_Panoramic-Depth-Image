const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const buildVersionPath = path.join(root, 'dist', '.build-version');

if (!fs.existsSync(buildVersionPath)) {
  console.log('dist/.build-version 不存在，需要 build');
  process.exit(1);
}
const buildVersion = fs.readFileSync(buildVersionPath, 'utf-8').trim();
if (buildVersion !== pkg.version) {
  console.log(`版本變更: ${buildVersion} → ${pkg.version}，需要 rebuild`);
  process.exit(1);
}

const buildMtime = fs.statSync(buildVersionPath).mtimeMs;
const watchDirs = ['src', 'server', 'shared'];
const skipDirs = new Set(['node_modules', 'dist', '.git']);

function newestMtime(dir) {
  let newest = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (skipDirs.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        const m = fs.statSync(full).mtimeMs;
        if (m > newest) newest = m;
      }
    }
  }
  return newest;
}

for (const dir of watchDirs) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  const srcMtime = newestMtime(abs);
  if (srcMtime > buildMtime) {
    console.log(`原始碼較新 (${dir})，需要 rebuild`);
    process.exit(1);
  }
}

process.exit(0);
