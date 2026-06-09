const fs = require('fs');
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ext = b => (b.slice(0, 30).includes('image/png') ? 'png' : 'jpg');
function save(b64, path) { const c = b64.indexOf(','); const data = (b64.startsWith('data:') && c > 0) ? b64.slice(c + 1) : b64; fs.writeFileSync(path, Buffer.from(data, 'base64')); }

// --- dishes ---
const dd = JSON.parse(fs.readFileSync('/tmp/nnsig/content/dishes.json', 'utf8'));
fs.mkdirSync('/tmp/nnsig/media/dishes', { recursive: true });
let nd = 0;
for (const x of (dd.dishes || [])) {
  if (x.img && x.img.startsWith('data:')) { const f = x.file || (slug(x.name) + '.jpg'); save(x.img, '/tmp/nnsig/media/dishes/' + f); x.img = '/media/dishes/' + f; nd++; }
}
fs.writeFileSync('/tmp/nnsig/content/dishes.json', JSON.stringify(dd, null, 1));

// --- drinks ---
const dr = JSON.parse(fs.readFileSync('/tmp/nnsig/content/drinks.json', 'utf8'));
fs.mkdirSync('/tmp/nnsig/media/drinks', { recursive: true });
let nk = 0;
for (const x of (dr.drinks || [])) {
  if (x.img && x.img.startsWith('data:')) { const f = slug(x.name) + '.' + ext(x.img); save(x.img, '/tmp/nnsig/media/drinks/' + f); x.img = '/media/drinks/' + f; nk++; }
}
fs.writeFileSync('/tmp/nnsig/content/drinks.json', JSON.stringify(dr, null, 1));

const kb = p => (fs.statSync(p).size / 1024 | 0) + 'KB';
console.log(`extracted ${nd} dish imgs, ${nk} drink imgs`);
console.log('dishes.json now', kb('/tmp/nnsig/content/dishes.json'), '| drinks.json now', kb('/tmp/nnsig/content/drinks.json'));
