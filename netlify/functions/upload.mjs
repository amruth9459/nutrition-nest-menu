import { getStore } from '@netlify/blobs';
// Chunked binary media upload — avoids the ~6MB function-payload limit that breaks base64-in-JSON uploads.
// Client splits a file into <=4MB raw chunks and POSTs each here; the last chunk assembles them into the media Blob.
//   POST /api/upload?path=<media-path>&i=<chunkIndex>&n=<totalChunks>   header x-pw: <admin password>   body: raw bytes
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  const i = parseInt(url.searchParams.get('i') || '0', 10);
  const n = parseInt(url.searchParams.get('n') || '1', 10);
  const pw = await getStore('config').get('password', { consistency: 'strong' });
  if (!pw) return json({ error: 'admin not set up yet' }, 503);
  if ((req.headers.get('x-pw') || '') !== pw) return json({ error: 'wrong password' }, 401);
  if (!path || /\.\.|^\//.test(path)) return json({ error: 'bad path' }, 400);
  try {
    const buf = Buffer.from(await req.arrayBuffer());
    const media = getStore('media');
    if (n <= 1) { await media.set(path, buf); return json({ ok: true, assembled: true, size: buf.length }); }
    const chunks = getStore('upload-chunks');
    await chunks.set(`${path}__${i}`, buf);
    if (i === n - 1) {
      const parts = [];
      for (let k = 0; k < n; k++) {
        const b = await chunks.get(`${path}__${k}`, { type: 'arrayBuffer' });
        if (!b) return json({ error: 'missing chunk ' + k + ' — re-upload' }, 400);
        parts.push(Buffer.from(b));
      }
      const full = Buffer.concat(parts);
      await media.set(path, full);
      for (let k = 0; k < n; k++) { try { await chunks.delete(`${path}__${k}`); } catch { /* best-effort */ } }
      return json({ ok: true, assembled: true, size: full.length });
    }
    return json({ ok: true, chunk: i });
  } catch (e) { return json({ error: String(e && e.message || e) }, 500); }
};
export const config = { path: '/api/upload' };
