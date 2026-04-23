const fs = require('node:fs');
const path = require('node:path');

const pkg = require('../package.json');
const buildVersionPath = path.join(__dirname, '..', 'dist', '.build-version');

if (!fs.existsSync(buildVersionPath)) {
  console.log('dist/.build-version 不存在，需要 build');
  process.exit(1);
}
const buildVersion = fs.readFileSync(buildVersionPath, 'utf-8').trim();
if (buildVersion !== pkg.version) {
  console.log(`版本變更: ${buildVersion} → ${pkg.version}，需要 rebuild`);
  process.exit(1);
}
process.exit(0);
