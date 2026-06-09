import { getStore } from '@netlify/blobs';
// One-time bootstrap: sets the admin password the first time it's called, then refuses.
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  let body; try { body = await req.json(); } catch { return json({ error: 'bad body' }, 400); }
  const cfg = getStore('config');
  if (await cfg.get('password')) return json({ error: 'already set up' }, 409);
  if (!body.password || String(body.password).length < 6) return json({ error: 'password must be 6+ chars' }, 400);
  await cfg.set('password', String(body.password));
  return json({ ok: true });
};
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
export const config = { path: '/api/setup' };
