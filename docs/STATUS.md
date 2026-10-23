# Status

**Live:** https://a2codex.prezenith.com (GitHub Pages, deploys on push to `main`).
**Done:** repo + mise (Node 24), project rules in CLAUDE.md, Astro scaffold (dark/light theme, `Base` layout), GitHub Pages workflow, DNS, **Stats page** (see below).
**Next:** Gear BiS (Enhancement page), then Arcana, Genus, Daevanion, Class pages. To publish a page, create `src/pages/<href>index.astro` and set `ready: true` in `src/data/nav.ts`. Money-saving tips go inside each category page, not a separate page.

## Stats page (`src/pages/stats.astro`), finished
- **Layout:** left, a wheel like the in-game Stat Info window (6 primary stats inside 10 Daevanion stats, 5 per side in the game's order), fixed to the screen and centred on desktop. Right, "Most important stats": 15 ranked rows with the official description, a plain-language note, which wheel stats raise it (coloured chips) and where to get it (GEAR / OTHER tags). Stacks on narrow screens.
- **Interaction:** hovering or tapping a wheel stat shows a tooltip and lights up the rows it raises; hovering a row lights up its wheel stats (gradient when two). Tag groups longer than four collapse behind a "+N" popup (hover/focus, or tap to pin, tap elsewhere to close).
- **Sources:** descriptions from aion2data.com / metabot.gg (Global client data); order and notes from the Aion 2 Bible (community guide). "Get it from" tags are generated: run `mise exec -- node scripts/global-sources.mjs` to rebuild `src/data/stat-sources.json` from metabot.gg's Global client data (re-run after each patch). Dashed tags (Genus Insight, Wings) are community or unconfirmed. See `docs/data-sources.md` for the source policy.
- **Tags link to pages** once the matching nav page is `ready` (map in `TAG_PAGE`, stats.astro).
- **Themes:** light uses the same styling as dark with colours retuned for white; do not restyle light separately. The theme toggle is an icon button in `Base.astro`.
- **Known gaps:** icons are generic Lucide stand-ins (real emblems need the owner's own screenshots, no chat/account details visible). Attack Bonus has no client-data source. Wings tag is unconfirmed on Global. Only the top two gear tiers are read by the sources script.

## How to test the layout (the browser pane is narrow)
- Desktop and ultrawide: load the page in an iframe sized 1280, 1920 or 3440 wide and scale it down with CSS transform, then measure with JS. Check phone width at about 360.
- Call `show_pane` (preview) before taking screenshots, or they time out.
- The dev server can serve stale CSS or layout code after many edits: restart it (`preview_stop`, `preview_start`) or hard refresh before judging a change.

## Dev
- `mise exec -- npm run dev` (http://localhost:4321), `mise exec -- npm run build`.
- Preview config for the app browser: `.claude/launch.json`.
