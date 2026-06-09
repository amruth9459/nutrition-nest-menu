import { getStore } from '@netlify/blobs';
// Serves manager-uploaded media (photos/videos) stored in Blobs.
const CT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm' };
export default async (req) => {
  const path = decodeURIComponent(new URL(req.url).pathname.replace(/^\/api\/media\//, ''));
  let buf = null;
  try { buf = await getStore('media').get(path, { type: 'arrayBuffer' }); } catch { /* miss */ }
  if (!buf) return new Response('not found', { status: 404 });
  const ext = (path.split('.').pop() || '').toLowerCase();
  const ct = CT[ext] || 'application/octet-stream';
  const total = buf.byteLength;
  const base = { 'Content-Type': ct, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public,max-age=120', 'Access-Control-Allow-Origin': '*' };
  // honor HTTP Range so <video> can stream/seek (some players require 206 responses)
  const range = req.headers.get('range');
  const m = range && /bytes=(\d+)-(\d*)/.exec(range);
  if (m) {
    const start = parseInt(m[1], 10);
    const end = m[2] ? Math.min(parseInt(m[2], 10), total - 1) : total - 1;
    if (start <= end && start < total) {
      return new Response(Buffer.from(buf).subarray(start, end + 1), { status: 206, headers: { ...base, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Length': String(end - start + 1) } });
    }
  }
  return new Response(buf, { status: 200, headers: { ...base, 'Content-Length': String(total) } });
};
export const config = { path: '/api/media/*' };
