const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs');

const dir = __dirname;
fs.mkdirSync(dir, { recursive: true });

async function main() {
  // 2:1 全景（4096x2048）
  await sharp({
    create: { width: 4096, height: 2048, channels: 3, background: { r: 100, g: 150, b: 200 } },
  })
    .jpeg()
    .toFile(path.join(dir, 'panorama-2to1.jpg'));

  // 非 2:1
  await sharp({
    create: { width: 1920, height: 1080, channels: 3, background: { r: 50, g: 50, b: 50 } },
  })
    .jpeg()
    .toFile(path.join(dir, 'panorama-16to9.jpg'));

  // 超大尺寸 (10000x5000)
  await sharp({
    create: { width: 10000, height: 5000, channels: 3, background: { r: 128, g: 128, b: 128 } },
  })
    .jpeg({ quality: 60 })
    .toFile(path.join(dir, 'panorama-huge.jpg'));

  // 灰階深度 (1024x512)
  await sharp({
    create: { width: 1024, height: 512, channels: 3, background: { r: 128, g: 128, b: 128 } },
  })
    .greyscale()
    .png()
    .toFile(path.join(dir, 'depth-small.png'));

  // 彩色深度 (用來測自動轉灰階)
  await sharp({
    create: { width: 2048, height: 1024, channels: 3, background: { r: 200, g: 100, b: 50 } },
  })
    .png()
    .toFile(path.join(dir, 'depth-colored.png'));

  console.log('fixtures generated');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
