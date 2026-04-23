const [major] = process.versions.node.split('.').map(Number);
if (major < 20) {
  console.error(`Node.js 20+ 為必要，目前版本 v${process.versions.node}`);
  process.exit(1);
}
process.exit(0);
