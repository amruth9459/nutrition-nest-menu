import { getStore } from '@netlify/blobs';
// Serves editable content. A manager's Blob-stored edits win per-key; the static seed
// committed in /content/<file>.json fills any keys the Blob lacks (so new sections added
// to the seed — e.g. a new menu block — always appear even when a Blob already exists,
// while the manager's edits are preserved). Self-heals: the next admin save rewrites the
// full object back to the Blob.
const isPlainObject = (v) => v != null && typeof v === 'object' && !Array.isArray(v);
export default async (req) => {
  const file = new URL(req.url).pathname.split('/').pop().replace(/\.json$/, '');
  let blob = null, seed = null;
  try { blob = await getStore('content').get(file, { type: 'json', consistency: 'strong' }); } catch { /* blob store may be empty */ }
  try { const r = await fetch(new URL('/content/' + file + '.json', req.url)); if (r.ok) seed = await r.json(); } catch { /* no seed */ }
  let data;
  if (blob == null) data = seed;
  else if (isPlainObject(blob) && isPlainObject(seed)) data = { ...seed, ...blob }; // blob wins per-key; seed fills gaps
  else data = blob;
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' }
  });
};
export const config = { path: '/api/content/:file' };
