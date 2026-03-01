const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, 'e2e-results.json');
const outPath = path.join(__dirname, 'e2e-results.csv');

if (!fs.existsSync(inPath)) {
  console.error('Input file missing:', inPath);
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const rows = data.results.map((r) => {
  const name = (r.name || '').replace(/"/g, '""');
  return `${r.countryCode},"${name}",${r.count}`;
});

fs.writeFileSync(outPath, ['countryCode,name,count', ...rows].join('\n'));
console.log('Wrote', outPath);
