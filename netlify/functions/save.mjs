import { getStore } from '@netlify/blobs';
// Password-gated. Writes a manager's edits (content + uploaded media) to Blobs.
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: 'bad body' }, 400); }
  const pw = await getStore('config').get('password', { consistency: 'strong' });
  if (!pw) return json({ error: 'admin not set up yet' }, 503);
  if (!body.password || body.password !== pw) return json({ error: 'wrong password' }, 401);
  try {
    const media = getStore('media');
    for (const u of (body.uploads || [])) {
      if (u && u.path && u.base64) await media.set(u.path, Buffer.from(u.base64, 'base64'));
    }
    if (body.file && body.content != null) await getStore('content').setJSON(body.file, body.content);
    return json({ ok: true });
  } catch (e) { return json({ error: String(e && e.message || e) }, 500); }
};
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
export const config = { path: '/api/save' };
