# ANTRA-WEB — Complete File Audit & Reconstruction Report
Generated: 2026-09-17

## 0. How this audit was actually done

Rather than trying to "scrape" the live website page by page (which can miss
files that aren't linked from any visible page), I went straight to the
source: `antra-web.github.io/Antra-Web/` is a **GitHub Pages site**, which
means it is served *directly* from a GitHub repository. I cloned that
repository (`github.com/antra-web/Antra-Web`) directly, so the "LIVE WEBSITE"
copy in this report is not a guess — it is the exact, literal file structure
that is live right now. I then cloned all 25 separate portfolio-project
repositories the same way (see Step 4).

---

## 1. The most important finding: your uploaded ZIP is an OLDER version of the site, not the current one

The ZIP you uploaded (`files__11_.zip`) contains:
- 11 HTML files, duplicated twice (once at the top level, once again inside
  a nested `antra-web-antra-integration.zip`) — both copies are byte-identical
  to each other.
- `css/antra-float.css`
- `js/antra-float.js`
- `js/agent-chat.js`
- `worker-antra-route-SNIPPET.js`

None of this is a "subset" of the live site — it's a **previous iteration**
of the chat-widget system. Specifically:

| | Uploaded ZIP | Live site (current) |
|---|---|---|
| Chat widget | One global floating "Antra" launcher (`antra-float.css`/`.js`) embedded on every page, pointing at `antra.web.n8n.cloud/webhook/antra-chat` through a Cloudflare Worker proxy (`antra-agents-proxy...workers.dev`) | Two dedicated pages, `ava.html` and `flow.html`, each with its own chat panel driven by `js/agent-chat.js`, calling n8n webhooks directly (no proxy) |
| Stylesheets loaded per page | `animations.css`, `responsive-repair.css`, `agent.css`, `antra-float.css` | `animations.css`, `responsive-repair.css`, `agent.css` (no `antra-float.css` — it was retired) |
| Mobile WhatsApp button | Missing an explicit `left/bottom` offset at the base widget position; slightly different small-screen offset | Has `position:fixed;left:24px;bottom:24px` explicitly, and a mobile media-query override to `16px/16px` |
| Footer social links (about.html) | Facebook + X/Twitter icon | Facebook only (X/Twitter icon removed) |
| Homepage schema.org JSON-LD | Includes `x.com/AntraWebDesign` in `sameAs` | X/Twitter link removed from `sameAs` |
| `worker-antra-route-SNIPPET.js` | Present (this is a Cloudflare Worker snippet for the old proxy) | Not part of the live static site at all — it would have lived in a separate Cloudflare Workers project, not this repo |

**Bottom line:** if I had built your "safe copy" from the ZIP, you would have
gotten a working GitHub Pages copy — but of an **outdated version** with the
old chat widget, missing the current Ava/Flow pages' correct behavior, and
missing several current CSS files. I did not do that. Per your own
instruction ("the current live website is the source of truth"), I used the
live repository as the base of the reconstruction, not the ZIP.

---

## 2. Complete inventory — LIVE site (`antra-web/Antra-Web` repo, root of the safe copy)

```
about.html
ava.html
case-studies.html
contact.html
device-preview.html
faq.html
flow.html
index.html
packages.html
portfolio.html
process.html
services.html
robots.txt
sitemap.xml
AVA-FLOW-audit-report.md      (a prior debugging report already in the repo — see §5)
css/style.css                 (see §3 — orphaned/unused)
css/animations.css
css/responsive-repair.css
css/agent.css
js/agent-chat.js
js/responsive-repair.js
config/portfolio-projects.json
scripts/capture-screenshots.mjs
scripts/package.json
assets/README.md
assets/manifest.json
assets/hero-animation.mp4
assets/hero-poster.jpg
assets/<25 portfolio thumbnail .png files>
```

Every `href=`/`src=` reference across all 12 HTML pages was checked against
this file list — **every internal asset, stylesheet and script reference
resolves correctly.** There are no broken relative paths (`../`, `assets/`,
`css/`, `js/`, `scripts/` all resolve as expected for a GitHub Pages
project-page deployment at `/Antra-Web/`).

### Present in uploaded ZIP but NOT on the live site
- `css/antra-float.css`, `js/antra-float.js` — retired chat-widget files
- `worker-antra-route-SNIPPET.js` — belongs to a separate Cloudflare Worker project, not the static site repo
- The nested duplicate copy of every HTML file (harmless duplication, not a separate version)

### Present on the live site but NOT in the uploaded ZIP
- `device-preview.html`
- `robots.txt`, `sitemap.xml`
- `css/style.css`, `css/animations.css`, `css/responsive-repair.css`, `css/agent.css`
- `js/responsive-repair.js`
- `config/portfolio-projects.json`
- `scripts/capture-screenshots.mjs`, `scripts/package.json`
- `assets/` — every image, the hero video, `manifest.json`, `README.md` (the entire portfolio-thumbnail asset system was absent from your ZIP)
- `AVA-FLOW-audit-report.md`

### Duplicate / unnecessary file found
- **`css/style.css` is not linked from any page.** Every page now carries its
  CSS inline in a `<style>` block instead. `style.css` appears to be a
  leftover from an earlier build. I preserved it in the safe copy (per your
  "do not remove existing features" instruction) but flagging it as inert.

### One broken reference worth knowing about
`assets/README.md` states this folder is "populated automatically by
**`.github/workflows/portfolio-screenshots.yml`**" — but **no `.github`
folder exists anywhere in the repository.** Either that workflow file was
deleted/never committed, or the 25 thumbnails currently in `assets/` were
placed there manually (the README does mention a "one-time manual seed" as
an option). This isn't something I can fix by guessing at a workflow file —
flagging it so you know the automated-refresh half of the thumbnail system
may not actually be running.

---

## 3. Path/reference check (Step 3 requirement)

Checked every `../`, `./`, `assets/`, `css/`, `js/`, `scripts/` reference in
all 12 pages of the live repo: **all resolve correctly** when the repo root
is placed at a GitHub Pages project path (e.g. `github.com/<you>/<new-repo>`
→ `<you>.github.io/<new-repo>/`), because every path in the source is
relative (no leading `/`) and no page uses an absolute `/Antra-Web/...`
path or a `<base>` tag that would break on a different repo name.

---

## 4. The 25 portfolio projects (Step 4)

Your brief says "18 portfolios" — the live `config/portfolio-projects.json`
(the single source of truth the site itself uses to drive both the
thumbnail-capture script and the portfolio page) actually lists **25**
projects. Every one of them is **its own separate GitHub repository under
the `antra-web` account**, each deployed as its own independent GitHub
Pages site — they are not folders inside the main `Antra-Web` repo. The main
site only holds a screenshot thumbnail + link for each; it does not embed
their code.

I cloned all 25 of those repositories directly (same method as the main
site) and included the complete, unmodified source of each one under
`portfolio-projects-backup/<name>/` in the safe copy, so nothing about them
depends on guesswork or screenshots.

| Project | Repo URL | Files | Notes |
|---|---|---|---|
| Restaurant | github.com/antra-web/Restaurant | 12 | multi-file |
| Field-Fold | github.com/antra-web/Field-Fold | 1 | single self-contained `index.html` |
| Gym Coach | github.com/antra-web/Gym-Coach | 8 | multi-file |
| Pest Control | github.com/antra-web/Pest-Control | 10 | multi-file |
| Interior Designing | github.com/antra-web/Interior-Designing | 11 | multi-file |
| Luxury Salon | github.com/antra-web/Luxury-Salon | 13 | multi-file |
| Custom Drinks | github.com/antra-web/Custom-Drinks | 52 | multi-file, larger asset set |
| DUMRAZZ | github.com/antra-web/DUMRAZZ | 267 | large project, full asset library |
| Salon | github.com/antra-web/salon | 9 | multi-file |
| Salon Spa | github.com/antra-web/Salon-spa- | 1 | single self-contained `index.html` |
| Custom Treats | github.com/antra-web/Custom-Treats | 7 | multi-file |
| Custom Cakes | github.com/antra-web/Custom-Cakes | 9 | multi-file |
| Custom Bouquets | github.com/antra-web/Custom-Bouquets | 7 | multi-file |
| Gym | github.com/antra-web/gym | 7 | multi-file |
| Cozy Cafe | github.com/antra-web/Cozy-Cafe | 6 | multi-file |
| One Site Cake | github.com/antra-web/One-Site-cake | 6 | multi-file |
| Cleaning Services | github.com/antra-web/cleaning-services | 11 | multi-file |
| Plumbing Service | github.com/antra-web/Plumbing-Service | 13 | multi-file |
| Bakery | github.com/antra-web/bakery | 6 | multi-file |
| Dentist | github.com/antra-web/Dentist | 6 | multi-file |
| Velora | github.com/antra-web/Velora | 1 | single self-contained `index.html` |
| Vanta | github.com/antra-web/VANTA | 381 | large project — full configurator, cinematic build |
| Made for a Moment | github.com/antra-web/Made-For-a-Momen | 11 | multi-file |
| Ashgrove Academy | github.com/antra-web/Ashgrove-Academy | 1 | single self-contained `index.html` |
| Loop and Bloom | github.com/antra-web/Loop-And-Bloom | 17 | multi-file |

The four "1 file" entries are not broken or incomplete — they're single
self-contained HTML files with the CSS/JS inlined, verified by opening each
and confirming full page content (600–1,850 lines each), not a stub.

**Files currently present:** complete source for all 25, copied verbatim,
nothing renamed or altered.
**Files missing:** none detected — every repo cloned cleanly with all
tracked files intact.

---

## 5. Ava & Flow (Step 5)

There was already a prior audit of this exact question sitting in the repo
as `AVA-FLOW-audit-report.md` (carried over into this safe copy unchanged).
Summary of its findings, confirmed by my own read of `ava.html`, `flow.html`
and `js/agent-chat.js`:

- Pure static frontend — no backend, no `.env`, no server code in this repo.
- Each panel POSTs to a real n8n Chat Trigger webhook:
  - Ava → `antra.app.n8n.cloud/webhook/...`
  - Flow → `lovely-webdev.app.n8n.cloud/webhook/...` (a **different** n8n
    account than Ava's)
- No hard-coded fake responses; failures are genuine `fetch()` rejections.
- Most likely failure cause, if either agent doesn't respond live, is an
  n8n-side setting (CORS allowed-origin, "Make Chat Publicly Available", or
  workflow Active toggle) — not a missing file.
- No API keys or secrets are exposed anywhere in the repo.

I did not find or invent any additional worker/webhook files beyond what
that report already documents — the ZIP's `worker-antra-route-SNIPPET.js`
belongs to the **retired** proxy architecture, not the current Ava/Flow
implementation.

---

## 6. The reconstructed package

```
antra-web-safe-copy/
├── (exact copy of the live Antra-Web repo — every file from §2, untouched)
└── portfolio-projects-backup/
    ├── Restaurant/
    ├── Field-Fold/
    ├── Gym-Coach/
    ├── ...  (all 25, each a verbatim copy of its own repo)
```

Nothing was redesigned, simplified, renamed, or replaced. `portfolio.html`,
`index.html`, and every other page are byte-for-byte what's live right now.
The `portfolio-projects-backup/` folder is additive — it doesn't change how
the main site works or is served; it's there purely so the 25 external
projects are backed up in the same place, per your instruction to preserve
each one's complete structure since they're separate sites.

To use this as a new repo: create the new empty GitHub repo, push everything
inside `antra-web-safe-copy/` to it (the main site files stay at repo root
so GitHub Pages serves it identically at `<newrepo>.github.io/<name>/`), and
enable Pages from the root. The `portfolio-projects-backup/` folder won't
interfere with Pages serving — it's just sitting there as backed-up source,
same as a `docs/` or `archive/` folder would be.

---

## 7. Verification checklist

- [x] Homepage — present, all assets resolve
- [x] About — present
- [x] Services — present
- [x] Packages/Pricing — present
- [x] Process — present
- [x] Portfolio (listing page) — present, links to all 25 external projects
- [x] Case Studies — present
- [x] Contact — present
- [x] FAQ — present
- [x] Ava — present, webhook config confirmed (see §5)
- [x] Flow — present, webhook config confirmed (see §5)
- [x] All 25 portfolio projects — cloned in full, verbatim (see §4)
- [x] Portfolio thumbnails/previews — all 25 `.png` files present in `assets/`
- [x] Images / hero video/poster — present
- [x] CSS — all 4 active stylesheets present; 1 orphaned file flagged (§2)
- [x] JavaScript — both active scripts present
- [x] Mobile / tablet / desktop layout — governed by inline `<style>` + `responsive-repair.css`, both intact and unmodified
- [x] Navigation, buttons, internal & external links — all targets exist
- [x] Forms — `contact.html` form markup intact and unmodified
- [x] Animations — `animations.css` intact
- [x] Fonts/icons — loaded via Google Fonts links in each page's `<head>`, unmodified
- [x] No missing files — confirmed against the live repo directly (not a guess)
- [x] No broken paths — every relative reference checked and resolves
- [x] No accidental redesign — zero HTML/CSS/JS content changed from what's live
