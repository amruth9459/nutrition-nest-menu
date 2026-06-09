import { getStore } from '@netlify/blobs';
// Serves manager-uploaded media (photos/videos) stored in Blobs.
const CT = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm' };
export default async (req) => {
  const path = decodeURIComponent(new URL(req.url).pathname.replace(/^\/api\/media\//, ''));
  let buf = null;
  try { buf = await getStore('media').get(path, { type: 'arrayBuffer' }); } catch { /* miss */ }
  if (!buf) return new Response('not found', { status: 404 });
  const ext = (path.split('.').pop() || '').toLowerCase();
  return new Response(buf, {
    headers: { 'Content-Type': CT[ext] || 'application/octet-stream', 'Cache-Control': 'public,max-age=120', 'Access-Control-Allow-Origin': '*' }
  });
};
export const config = { path: '/api/media/*' };
