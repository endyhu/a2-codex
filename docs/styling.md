# Styling reference

Look here before inventing a style. Everything shared lives in `src/styles/global.css`; page-only styles live in the page's `<style>`. If a value below disagrees with the code, the code wins: fix this file.

## Principles
- Dark theme is the design; light keeps the same styling and only retunes colours (never restyle light separately).
- Calm and game-UI like: flat 3px corners, thin 1px lines, one accent, soft glows. No big rounded boxes, no heavy shadows.
- No filler text about the page itself. Page titles are bare (`<h1 class="page-title">`).
- Match an existing pattern before adding a new one. Check the table below first.

## Tokens (`:root`, light overrides under `[data-theme='light']`)
`--bg` page, `--panel` surfaces, `--panel-2` hover fill, `--line` hairlines (7% white), `--text`, `--muted`, `--accent` (#8b7bff dark, #5b47e8 light), `--accent-soft` (14% accent fill), `--ok`, `--warn`, `--radius` 14px (only the unused `.table-wrap` still uses it).
Colour mixing: `color-mix(in srgb, var(--accent) N%, transparent)`. Hued items use `hsl(var(--h) 70% 55% / a)`.

## Shapes
| Thing | Recipe |
|---|---|
| Corner radius | 3px for panels, cards, rows, buttons, tooltips, sidebar items, update banner; 999px for pills/tags; 50% for round buttons and number badges |
| Panel | `.panel`: radial accent-soft gradient at top over `--panel`, 1px `--line`, 14px 16px padding; head via `.panel-head` |
| Inner card/row | `background: var(--panel)`, 1px `--line`, 3px radius |
| Page title | `.page-title`: 1.9rem, 4px gradient accent bar before it |
| Home card | `.card`: same gradient as `.panel`, 3px radius, 18px padding |
| Tooltip | shared look in global.css (`#tip`, `[data-tip]`): `#0d1018`, 1px white 14%, 3px radius, `0 8px 28px` black 50% |
| Spacing | steps on Gear are a uniform 32px; keep gaps uniform inside a group |

## Hover, focus, glow
Hover and focus-visible always match. Transitions 0.15s (0.4s for the Stats row highlight).
| Thing | Effect |
|---|---|
| Plain link/pill (tags, rail) | border to accent (rail: 55% accent), text to `--text` or accent; no glow |
| Home card (live) | border `--accent`, `box-shadow: 0 0 20px -8px var(--accent)`, no lift |
| Primary action button (`.bsl`, `.path a.ext`) | idle `0 0 20px -8px accent` (24px -4px on ext), hover `0 0 28px -4px accent`, lift `translateY(-1px)`, gradient fill gets stronger |
| Stats wheel node / highlighted row | `0 0 18px` hued glow at 50%; row `0 0 22px -6px` at 35% |
| Section glow (Gear, on scroll or link click) | `0 0 0 1px` accent 60% ring + `0 0 40px` accent 40%, fades out; steps use the edge-strip gradients, see STATUS |
Rule of thumb: glows are soft (negative spread, 16-28px, accent only). The strong 40px ring glow is for the transient "you landed here" flash, not hover. Disabled / "soon" items: `opacity` 0.45-0.5, no hover effect.

## Icons
- Lucide via `lucide-static` (`?raw` import), 24 viewBox, `stroke-width` 2, round caps/joins, `currentColor`. Sidebar 18px, sub items 14px, home card 22px, accent colour on cards.
- When Lucide has no icon, draw a custom SVG inline in the same style (stroke only, no fills, `stroke-width` 1.75 is fine for dense icons) and fill the 24 box about as much as the neighbours (about 20 tall). Example: the Arcana fan in `src/data/nav.ts` (two same-size cards, mirrored tilt, back card hidden behind the front with a mask so strokes do not cross).
- Check an icon at 3-6x enlarged (scale the `.ico` with JS) next to its neighbours in the dark theme, and also at real size in the sidebar (open the phone menu) before shipping.

## Layout and responsiveness
- Content `main` is max 960px, centred; sidebar 248px; under 820px the sidebar becomes a slide-in menu with a top bar.
- Owner asks from desktop (incl. ultrawide); choose phone/tablet behaviour yourself. Check 1280, 1920, 3440 and about 360.
- Stats and Gear use wider layouts with sticky rails; see STATUS.md for their rules.

## Content-in-UI rules
- No Confirmed/Community badges; dashed tags mean community-sourced (Stats only).
- Nav is one flat list in in-game order, labels are in-game names (`src/data/nav.ts`).
- Card text on the home page is one short line, no "what not to waste" phrasing there (money-saving tips live inside each page).

## New category page checklist (Gear and Genus Insight are the reference)
Do all of these on every new page, without being asked. Compare against `src/pages/gear/index.astro` before saying it is done.
- **Width:** `<style is:global> main { max-width: 1500px; }`. Check that `main` and the first `.panel` measure the same as on Gear in a 1920 iframe.
- **Frame:** bare `<h1 class="page-title">`, then `.panel`s with `.panel-head`; use the shared `.slot-cards`/`.slot-card`, `.path` step and `.saving` table classes from `global.css` instead of inventing new ones. Table labels bold (`.saving tbody th`), no uppercase override.
- **Two-column sections:** text left, table or ladder right (`.enh`-style grid, 360px right column, stack at 1280px).
- **Sources line:** `<p class="meta sources">` at the bottom (`.sources` is shared).
- **Section glow:** `.panel.flash` glow (`@keyframes glow`) on arrival, on a sidebar sub-link click (after the scroll settles) and when scrolling reaches the next section, plus the sidebar sub-link `on` highlight. Styles are shared (`.panel.flash`); in the page script call `sectionGlow([...section ids])` from `src/scripts/section-glow.ts` inside `astro:page-load` (see Genus); add the sections as `children` in `nav.ts`.
- **Lists of lines:** ranked lines get numbers and the first rank is highlighted; unranked lines get the round `.dot` marker. Notes go under the name, never beside it (names must not wrap).
- **Wording:** plain US English ("more expensive", not "dearer").
- **Check:** restart the dev server after CSS edits (stale styles), measure in a wide iframe, and look at 360px.
