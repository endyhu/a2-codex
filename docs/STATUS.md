# Status

**Done:** repo + mise (Node 22), project rules in CLAUDE.md, Astro 7 scaffold (dark/light theme, `Base` layout, `Badge` component, Home, Stats stub), GitHub Pages workflow (`.github/workflows/deploy.yml`), `public/CNAME` = `codex.prezenith.com`.
**Decision:** no game-client extraction. Data is written by hand into `src/data/`, from Metabot/aion2data (linked on the page) plus the owner's in-game checks.
**Next:** flesh out Stats (sub-stats, caps once confirmed), then Gear BiS. Add each new page to the nav in `src/layouts/Base.astro` and flip `ready: true` in `src/pages/index.astro`.

## Dev
- `mise exec -- npm run dev` (http://localhost:4321), `mise exec -- npm run build`.
- Preview config for the app browser: `.claude/launch.json`.

## Not done yet (owner action)
- Create the GitHub repo, push `main`, set Pages source to "GitHub Actions".
- DNS: CNAME record `codex` -> `<github-user>.github.io`, then enable HTTPS in Pages settings.
- Confirm the subdomain (currently `codex.prezenith.com`; change `public/CNAME` and `astro.config.mjs` if different).
