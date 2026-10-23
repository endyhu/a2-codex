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

Clean, modern cheatsheet site for the **AION 2 Global** server. Hosted free on GitHub Pages at a subdomain of prezenith.com (default `codex.prezenith.com`, not yet confirmed).

## Working rules (from the owner)
- **Git:** local repo, commit here. **No AI attribution anywhere**: no `Co-Authored-By`, no "Generated with" lines in commits, PRs, code or docs.
- **One session per feature.** Keep this file and `docs/` current so a fresh session can start fast. At the end of a feature, update `docs/STATUS.md`.
- **Tooling:** Node via `mise` (`mise.toml`, Node 22). Run commands with `mise exec -- npm ...` if Node isn't on PATH.
- **Stack:** Astro (static), Markdown/MDX pages, game data as JSON/YAML in the repo, dark theme default, mobile-first.

## Content rules
- Global server only. Use the **Global client's English names**. No Korea/KR/TW references, no Korean-to-Global glossary, no "KR values" sections.
- Cheatsheet style: lead with the answer (table), short "why" below. No roadmap, beginner or leveling pages.
- Never invent numbers. If a value can't be confirmed for Global, leave it out.
- Each BiS entry carries a badge: **Confirmed** (checked in Global game data) or **Community pick** (used by top players, not provable from data).
- Images: use own screenshots or link out. Do not hotlink or copy third-party site assets (e.g. questlog.gg, metabot.gg); linking to their pages is fine.

## Planned pages (approved)
Home, Gear BiS, Gear stat lines (BiS lines), Arcana BiS, Genus BiS, Daevanion BiS, Class pages, Save Kinah, Stats reference.
Build order: scaffold, Gear BiS + Stats, Arcana, Genus, Daevanion, Class pages last. Later ideas: Abyss shop, weekly checklist, calculators.

## Pointers
- `docs/STATUS.md`: what's done, what's next.
- `docs/data-sources.md`: where facts come from, verified Global terms, game-client findings.
