const fs = require('fs');
const path = require('path');

async function main() {
  const svgPath = path.join(__dirname, '..', 'public', 'trone-lts.svg');
  const outPng = path.join(__dirname, '..', 'public', 'trone-lts.png');
  const outIco = path.join(__dirname, '..', 'public', 'trone-lts.ico');

  let sharp;
  let pngToIco;
  try {
    sharp = require('sharp');
    pngToIco = require('png-to-ico');
  } catch (err) {
    console.error('\nMissing required packages: `sharp` and `png-to-ico`.');
    console.error('Install them with:');
    console.error('\n  npm install --save-dev sharp png-to-ico\n');
    process.exit(1);
  }

  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found:', svgPath);
    process.exit(1);
  }

  const svg = fs.readFileSync(svgPath);

  console.log('Generating PNG (192x192) ->', outPng);
  await sharp(svg)
    .resize(192, 192, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outPng);

  const sizes = [64, 128, 256];
  const tmpPngs = [];

  for (const s of sizes) {
    const tmp = path.join(__dirname, '..', 'public', `trone-lts-${s}.png`);
    await sharp(svg)
      .resize(s, s, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(tmp);
    tmpPngs.push(tmp);
  }

  console.log('Generating ICO ->', outIco);
  const icoBuf = await pngToIco(tmpPngs);
  fs.writeFileSync(outIco, icoBuf);

  // cleanup
  for (const t of tmpPngs) {
    try {
      fs.unlinkSync(t);
    } catch (e) {}
  }

  console.log('Done: created', outPng, 'and', outIco);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
