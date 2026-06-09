# Nutrition Nest — Live Signage System

A self-updating signage system. Managers edit content in an **admin panel** (or the JSON files); every screen reads that content live and refreshes itself. No rendering, no manual redeploy.

## What's here
```
content/      The editable content (one JSON per display)
media/        Swappable photos/videos (dish, drink, aisle images, uploads)
assets/       Brand fonts + logos (shared)
displays/     The live screens (each reads content/ at runtime, auto-refreshes)
admin/        The admin panel (Decap CMS) — forms + image uploads
```

## The screens (live URLs)
Base: `https://nutrition-nest-signage.netlify.app`

| Screen | URL |
|--------|-----|
| Juice board | `/displays/board/` |
| Juice reel | `/displays/reel/` |
| Restaurant | `/displays/restaurant/` |
| Aisle 1–12 | `/displays/aisle/?n=1` … `?n=12` |
| Phone menu | `/displays/menu/` |
| **Admin** | `/admin/` |

## One-time setup to turn the admin on
The screens already work. The admin needs Netlify Identity + Git Gateway (so managers can log in and save). Do this once:

1. **Push the repo to GitHub** (already committed):
   `git push origin main`
2. **Link this Netlify site to the repo** — Netlify → site `nutrition-nest-signage` → *Site configuration → Build & deploy → Link repository* → GitHub → `nutrition-nest-menu`. (Build command: none. Publish directory: `/` root.)
3. **Enable Identity** — *Identity → Enable Identity*.
4. **Enable Git Gateway** — *Identity → Services → Git Gateway → Enable*.
5. **Invite the manager** — *Identity → Invite users* → their email. They set a password and log into `/admin/`.

After this: a manager opens `/admin/`, edits any screen's content or uploads a new photo/video, hits **Publish** → the screen updates itself within ~45 seconds.

## Pointing the panels at the screens
- **Clinic KTC** (Fully Kiosk): set Start URL to the clinic page. (Already a live browser.)
- **SH37C panels** (MagicINFO): add **URL/Web content** pointing at each screen's URL above, scheduled to that panel's group. *(Pending one fidelity check — if the panel's browser renders these crisply, use URLs directly; if not, fall back to auto-rendered images/videos that rebuild on edit.)*

## Editing without the admin (fallback)
You can always edit `content/*.json` directly in GitHub's web editor — same result.
