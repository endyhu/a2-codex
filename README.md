# AION 2 Codex

Cheatsheet site for the AION 2 Global server. Static Astro site, live at https://a2codex.prezenith.com.

## Requirements

- Node 22 (pinned in `mise.toml`)
- [mise](https://mise.jdx.dev) is optional but recommended; it installs the right Node version.

```bash
mise install
```

If Node isn't on your PATH, prefix any command below with `mise exec --`, e.g. `mise exec -- npm run dev`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321. Changes hot-reload.

## Build and preview

```bash
npm run build     # outputs static site to dist/
npm run preview   # serves dist/ locally to check the production build
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. The custom domain is set by `public/CNAME`.

One-time setup (already done if the site is live): in the repo's Settings > Pages, set Source to "GitHub Actions", and add a `CNAME` DNS record for `a2codex` pointing to `<github-user>.github.io`.

## Project layout

| Path | What's there |
| --- | --- |
| `src/pages/` | One file per page (URL = file path) |
| `src/data/nav.ts` | Navigation, mirrors the in-game menu names |
| `src/components/` | Shared components (e.g. `Badge.astro`) |
| `src/layouts/Base.astro` | Page shell |
| `src/styles/global.css` | Theme and global styles |
| `public/` | Static files copied as-is (favicon, CNAME) |
| `docs/STATUS.md` | What's done and what's next |
| `docs/data-sources.md` | Where game facts come from |

## Adding a page

1. Create `src/pages/<name>.astro` (or a folder with `index.astro`) using the `Base` layout, as in `stats.astro`.
2. Add it to `src/data/nav.ts`, using the exact in-game menu label.
3. Check it with `npm run dev`, then commit and push to `main`.

## Content rules

See `CLAUDE.md`: Global server only, English Global names, no invented numbers, BiS entries are tagged **Confirmed** or **Community pick**, and no personal info in the repo.
