# Status

**Live:** https://a2codex.prezenith.com (GitHub Pages, deploys on push to `main`).
**Done:** repo + mise (Node 24), project rules in CLAUDE.md, Astro scaffold (dark/light theme, `Base` layout), GitHub Pages workflow, DNS, **Stats page**, **Gear page**, finished (see below).
**Next:** Arcana, then Pets/Genus, Daevanion, Class pages. To publish a page, create `src/pages/<href>index.astro` and set `ready: true` in `src/data/nav.ts`. Money-saving tips go inside each category page, not a separate page.

## Stats page (`src/pages/stats.astro`), finished
- **Layout:** left, a wheel like the in-game Stat Info window (6 primary stats inside 10 Daevanion stats, 5 per side in the game's order), fixed to the screen and centred on desktop. Right, "Most important stats": 15 ranked rows with the official description, a plain-language note, which wheel stats raise it (coloured chips) and where to get it (GEAR / OTHER tags). Stacks on narrow screens.
- **Interaction:** hovering or tapping a wheel stat shows a tooltip and lights up the rows it raises; hovering a row lights up its wheel stats (gradient when two). Tag groups longer than four collapse behind a "+N" popup (hover/focus, or tap to pin, tap elsewhere to close).
- **Sources:** descriptions from aion2data.com / metabot.gg (Global client data); order and notes from the Aion 2 Bible (community guide). "Get it from" tags are generated: run `mise exec -- node scripts/global-sources.mjs` to rebuild `src/data/stat-sources.json` from metabot.gg's Global client data (re-run after each patch). Dashed tags (Genus Insight, Wings) are community or unconfirmed. See `docs/data-sources.md` for the source policy.
- **Tags link to pages** once the matching nav page is `ready` (map in `TAG_PAGE`, stats.astro).
- **Themes:** light uses the same styling as dark with colours retuned for white; do not restyle light separately. The theme toggle is an icon button in `Base.astro`.
- **Known gaps:** icons are generic Lucide stand-ins (real emblems need the owner's own screenshots, no chat/account details visible). Attack Bonus has no client-data source. Wings tag is unconfirmed on Global. Only the top two gear tiers are read by the sources script.


## Gear page (`src/pages/gear/index.astro`), finished
- **Layout:** "Best stat lines" (cards per slot, with roll chances) then "Enhancement order": six steps (Enhance, Amplify, Soul Binding, Manastones, Theostone, Potential), each laid out for what it is (no shared template). Steps that do not survive a transfer (Manastones, Theostone, Potential) carry a small icon with a hover tooltip and a legend. Data is inline in the page frontmatter. Spacing between steps is a uniform 32px.
- **Sidebar sub-sections:** Gear lists its sections (Best stat lines and the six steps) under it in the left menu via `children` in `src/data/nav.ts`; they link to the page anchors and the active step highlights as you scroll. Children show only in the sidebar, not on the home page cards.
- **Navigation:** from 1800px wide a sticky rail sits in the page margin outside the cards (plain numbers joined by a line, the active step highlights as you scroll, Back to top under it; step names appear from 2200px). Both cards keep full width. Below 1800px the rail is a sticky horizontal bar above the Enhancement order card and the global back-to-top button (`#to-top` in `Base.astro`, shows after 700px) takes over. Two-column steps stack below 1280px. Smooth scroll is on site-wide (off for reduced motion).
- **Section glow (Gear):** a section glows when you click a link to it (after the scroll stops), when manual scrolling reaches it, and for each section a clicked link scrolls past (the previous glow then fades out in 0.6s). Best stat lines glows through a 40px-blur shadow with a 1px ring at 60% accent; each step uses a matching fade drawn as gradient strips along the card edges (44px reach, same falloff, same 1px edge line) so a lit step never shows a box edge. The strips are in `src/pages/gear/index.astro` (`.path > li.flash::after`); change `--f`/`--g1..--g5`/`--ring` there to retune. The trigger line for the active section slides from 30% of the screen down to the bottom as you near the end of the page, so the last short steps can become active on tall screens. Reduced motion turns the glow off.
- **Enhance:** success ladder +11 to +15 with average tries (pity +5% per failure, assumed to reset per level); "cheaper route" sub-section: buy level 36 Unique pieces, Soul Bind for four lines, enhance to +15, Transfer to the level 86 piece (2 Unique Transfer Stones, guaranteed), with a savings table (per-try costs 36 vs 86 from a community Reddit post, averages with failures from metabot). No links to the post or the video (owner).
- **Amplify:** odds table (chance, pity, average tries, Kinah and Stones per step) and diamonds by item level from metabot; stats at 5 diamonds per gear type from the Aion 2 Bible (only the max is published, per-diamond values are not).
- **Soul Binding:** stat lines are random per piece type, changed with Bind (rate over 10 steps), Sync (one line), Reset (all lines) and moved with Transfer; per-step Unique Bind costs and the extra Manastone slot at 100% are from metabot, the roles from the Bible and community posts. A button jumps to the Best stat lines panel.
- **Manastones:** roll order with per-roll chances (Superior stone, metabot), slots by gear grade and how each stone grade is obtained (metabot). **Theostone:** kept short on purpose (about 1% PvE damage, Meslamtaeda's Greed Stun for PvP, both from the owner) plus a preview button. **Potential:** one line and a four-row table.
- **Sources:** every best line was checked against each slot's Global random-stat pool (metabot.gg item pages, top tier). Order and rules are from the Aion 2 Bible, enhancement/Amplify/Soul Binding/Manastone numbers from metabot's Global data, and no badges are shown (owner rule). Dropped as not on Global: Cloak Perfect Chance, Brooch, Pendant. Bible "Smite" = Double Chance, "Movement Speed" = Move Speed. Bracelet, Amulet and Belt were removed (owner: no control over them yet on Global).
- **Known gaps:** roll chances come from metabot item pages (same on both top tiers and all weapon types); skill-line chances not shown. Rune left out (only unconfirmed Bible numbers). Synch, Amplify and Potential Stones and per-roll Manastone costs are not verified in Global data. Per-diamond Amplify stats and per-roll Manastone Kinah costs are not published anywhere checked.
- **Not done:** per-class weapon picks, specific item names per slot, phone-width check of the new step bar and rail.
- **Open questions:** the Bible says 100% Soul Binding unlocks an extra stat line (Philosopher's Stone), metabot says an extra Manastone slot; the page follows metabot. The Bible lists different Potential values than the page (owner's numbers kept). No Heroic or Mythic gear in the Global client, so no Heroic content.

## Shared styling
`src/styles/global.css` holds the chrome every page uses: `.panel`, `.panel-head`, `.page-title` and the tooltip look (`#tip` on Stats, `[data-tip]` hover tips on Gear). Put new shared styles there, not in a page.

## How to test the layout (the browser pane is narrow)
- Desktop and ultrawide: load the page in an iframe sized 1280, 1920 or 3440 wide and scale it down with CSS transform, then measure with JS. Check phone width at about 360.
- Call `show_pane` (preview) before taking screenshots, or they time out.
- Animations barely run in the hidden preview pane. To judge a glow, add the `flash` class by script and freeze it with a style override (`animation: none; opacity: 1` for the step strips), then compare frozen frames; check sizes and edges with `getComputedStyle(el, '::after')`.
- The dev server can serve stale CSS or layout code after many edits: restart it (`preview_stop`, `preview_start`) or hard refresh before judging a change.

## Dev
- `mise exec -- npm run dev` (http://localhost:4321), `mise exec -- npm run build`.
- Preview config for the app browser: `.claude/launch.json`.
