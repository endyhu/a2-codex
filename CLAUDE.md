# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Project: AION 2 Codex

Clean, modern cheatsheet site for the **AION 2 Global** server. Hosted free on GitHub Pages at a subdomain of prezenith.com (`a2codex.prezenith.com`).

## Working rules (from the owner)
- **Git:** local repo, commit here. **No AI attribution anywhere**: no `Co-Authored-By`, no "Generated with" lines in commits, PRs, code or docs.
- **One session per feature.** Keep this file and `docs/` current so a fresh session can start fast. At the end of a feature, update `docs/STATUS.md`.
- **Tooling:** Node via `mise` (`mise.toml`, Node 24). Run commands with `mise exec -- npm ...` if Node isn't on PATH.
- **Stack:** Astro (static, client-side router: page scripts follow the pattern in `docs/STATUS.md` > Page switches; open tabs get a "New version available" bar from `version.json`), Markdown/MDX pages, game data as JSON/YAML in the repo, dark theme default, mobile-first.
- **Commits:** decide commits and amends yourself at sensible checkpoints; do not ask. On "finalize feature": quick inspection (say so if it is not actually ready), clean up, commit, push, update `docs/` and this file.
- **UI rules:** the owner asks for features from a desktop (incl. ultrawide) perspective; choose phone/tablet behaviour yourself. No filler or explanatory text about the page itself. Info that matters is visible, not hover-only, but use good UX (a visible "+N" popup is fine). Light theme keeps the dark theme's styling; only retune colours. Do not suggest support/tank/DPS splits unless a source says priorities differ.
- **Verify layout** in a wide iframe (1280, 1920, 3440) plus about 360 for phones; restart the dev server if styles look stale. Details in `docs/STATUS.md`.

## Content rules
- Global server only. Use the **Global client's English names**. No Korea/KR/TW references, no Korean-to-Global glossary, no "KR values" sections.
- Cheatsheet style: lead with the answer (table), short "why" below. No roadmap, beginner or leveling pages.
- Never invent numbers. If a value can't be confirmed for Global, leave it out.
- No Confirmed / Community pick badges anywhere (owner does not want them). Still only publish what is checked against Global data; community-sourced items may stay, but without badges. Dashed tags on the Stats page mark community-sourced tags.
- Before saying a source exists on Global (slot, system, stat), check it against Global client data: `mise exec -- node scripts/global-sources.mjs`. Community guides are KR-based and name things that do not exist on Global (e.g. a Brooch slot). Source ranking is in `docs/data-sources.md`.
- Images: use own screenshots or link out. Do not hotlink or copy third-party site assets (e.g. questlog.gg, metabot.gg); linking to their pages is fine.

## Planned pages (approved)
Navigation mirrors the in-game menu and uses its exact names (see `src/data/nav.ts`):
- Character > **Stats** (stats reference), **Gear** (Gear BiS, stat lines/BiS lines, enhancement order; the owner's name, replaces the in-game "Enhancement"), **Pets** (Genus BiS lives at `pets/genus/`), **Arcana** (Arcana BiS)
- Menu > **Daevanion** (node routes), **Skills** (class pages)
Do not invent menu names; if a page needs a new one, copy the in-game label.
Build order: scaffold, Stats (done), Gear (done), Arcana, Genus, Daevanion, Class pages last. Later ideas: Abyss shop, weekly checklist, calculators.
When a page ships, the "Get it from" tags on the Stats page link to it automatically (flip `ready` in `nav.ts`; mapping in `TAG_PAGE` in `stats.astro`).

## Start of every session
Read `docs/STATUS.md` first (what's done, what's next), then `docs/data-sources.md` when touching game facts. Do this without being asked.

## Privacy (repo will be public)
Never commit personal info: real names, emails, usernames, character names, local file paths, screenshots with chat or account details, tokens or keys. Game install paths in docs stay generic.

## Pointers
- `docs/STATUS.md`: what's done, what's next.
- `docs/data-sources.md`: source policy (what to trust for Global), verified Global terms, how to cross-check sources, game-client findings.
- `scripts/global-sources.mjs` -> `src/data/stat-sources.json`: where each stat can be obtained, from Global client data. Re-run after patches.

## Money-saving tips
There is no separate "save money" page. Put "what not to waste resources on" inside each category page (Gear, Arcana, Pets/Genus). A Market page for cross-server price comparison is a possible later addition, not planned yet.
