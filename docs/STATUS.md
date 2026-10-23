# Status

**Done:** repo + mise (Node 24), project rules in CLAUDE.md, Astro 7 scaffold (dark/light theme, `Base` layout, `Badge` component, Home, Stats stub), GitHub Pages workflow (`.github/workflows/deploy.yml`), `public/CNAME` = `a2codex.prezenith.com`.
**Layout (redesigned):** left sidebar, grouped like the in-game menu (Character / Menu), defined in `src/data/nav.ts` (label, href, icon, `ready`, blurb). Home cards are generated from it. To ship a page: create `src/pages/<href>index.astro` and set `ready: true`. Icons are Lucide (`lucide-static`), monochrome; the exact in-game icons are not available (client is encrypted, see data-sources.md).
**Nav names:** match the in-game menu exactly. Genus is a sub-page of Pets (`sub: true` in nav.ts); Gear BiS is under Enhancement.
**Decision:** no game-client extraction. Data is written by hand into `src/data/`, from Metabot/aion2data (linked on the page) plus the owner's in-game checks.
**CI:** Node 24 (LTS), actions on latest majors (checkout/setup-node v7, pages actions v5). Cloudflare record must stay DNS only (grey cloud).
**Next:** flesh out Stats (sub-stats, caps once confirmed), then Gear BiS. To publish a page, flip `ready: true` in `src/data/nav.ts`. Money-saving tips go inside each category page, not a separate page.

## Dev
- `mise exec -- npm run dev` (http://localhost:4321), `mise exec -- npm run build`.
- Preview config for the app browser: `.claude/launch.json`.

## Not done yet (owner action)
- Repo created, `main` pushed, DNS (grey-cloud CNAME) and custom domain verified. Still to confirm: a green deploy run after the Node 24 / actions update, then the site loading at the custom domain.
