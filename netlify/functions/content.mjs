import { getStore } from '@netlify/blobs';
// Serves editable content. Returns the Blob-stored version if a manager has edited it,
// otherwise falls back to the static seed committed in /content/<file>.json.
export default async (req) => {
  const file = new URL(req.url).pathname.split('/').pop().replace(/\.json$/, '');
  let data = null;
  try { data = await getStore('content').get(file, { type: 'json' }); } catch { /* blob store may be empty */ }
  if (data == null) {
    try { const r = await fetch(new URL('/content/' + file + '.json', req.url)); if (r.ok) data = await r.json(); } catch { /* no seed */ }
  }
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' }
  });
};
export const config = { path: '/api/content/:file' };
