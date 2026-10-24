# Data sources

## Verified Global terms (from data-mined Global-client sources: aion2data.com/stats, metabot.gg/en/aion-2/stats)
- 6 primary stats: Might (raises Attack), Dexterity, Intelligence, Constitution, Precision, Willpower.
- Not Global names: "Smite", "Magic Boost", "Magic Amplification". Do not use them. Use Double Chance, Attack, Damage Boost, Penetration.
- Daevanion stats are "Concept [Deity]", e.g. Justice [Nezekan], Destruction [Zikel], Freedom [Vaizel], Death [Triniel], Illusion [Kaisinel], Wisdom [Lumiel], Life [Yustiel], Destiny [Marchutan], Time [Siel], Space [Israphel].
- "Genus" in the stat data means creature types (Cogni, Fera, Natura, Varian). Check how the Genus *board* system is named in-game before writing the Genus page.
- Caps: earlier sources disagreed (Critical Hit 50% vs 80%, Evasion 30% vs 50%). As of 2026-10-23 aion2data and metabot both state Critical Hit 50%, Evasion 30%, Cooldown 60%, MP Cost 60%, Move Speed 150%; aion2data also Immunity 50%. Those are published on the Stats page; an in-game check is still worth doing. Only publish a cap once confirmed.

## Arcana (Metabot, Global client): 5 slots (Bell, Chalice, Compass, Mirror, Parchment), ~40 cards, 2 sets, cards max level 5. Unconfirmed endgame recipes.

## Community PVE guide (Google Doc, link out only)
https://docs.google.com/document/d/11u4wLCG1WfL-xSka2Aze0rI9vYRa7mq3N3Gp1bt0AWY
- Fan-made, work in progress. Chapters: gear, stat lines per slot, skills, enhancement/transfer, Arcana, Daevanion, Genus, damage formula and stat efficiency.
- Much of it is Asia/KR data and the author marks many values as unconfirmed for Global. Treat everything as **Community pick** at best; do not copy values without a Global check.
- Agrees on Critical Hit cap 50% (Global). Its "80% cap" lines are the Accuracy-vs-Block and Crit-vs-Resist parry formulas, probably the source of the old 80% claim.
- Spells the deity "Vailzel"; the stat pages use Vaizel.
- Useful later for: Gear BiS (stat line rarity per slot), Arcana set effects, Daevanion board layout, damage formula.

## Aion 2 Bible (https://www.aion2bible.com, link out only)
- Single-page community guide by the same author as the Google Doc above. Content is rendered client-side, so a plain fetch returns almost nothing; read it in a browser.
- Mixes KR/TW and Global values and uses KR names ("Smite" = Double Chance). Treat as **Community pick**.
- Settles the old Critical Hit cap disagreement: 50% on Global, 80% on KR/TW.
- Stat value ranking (damage per point, KR end-game): Double Chance > Front/Back Damage Boost > Weapon Damage Boost ~ Critical Damage Boost > Damage Boost > Multi-hit Chance (needs testing) > Perfect Chance (called overrated) > Attack > Max Attack > Attack Bonus. Combat Speed is called worth stacking.
- Cooldown Reduction: hard cap 60%, but most classes only need a 30-40% breakpoint; class dependent, no global rank. It does not rank Penetration, Endurance, Regeneration, Block, MP Cost or Immune, so their order on the Stats page is a placeholder.
- Stat Value Index and Defensive stats sections load dynamically; the Defensive stats & caps content was not readable.
- Its gear lists are Korean gear. It names a "Brooch" slot and "Pendant"; the Global client has neither (see below), so those were dropped. Use it for ranking and explanations, never for what exists on Global.

## Source policy: what to trust for Global
Ranked by credibility. A fact on the site needs a source from tier 1 or 2; tier 3 is allowed only when marked as a community pick.
1. **Global client data tables (read by fan tools, unofficial).** Use for what exists, stat names and descriptions, caps, where a stat can be obtained.
   - **aion2data.com**: reads the Global client, "version 2026.10.21 (Steam build 26077854)", re-read after every weekly patch; nothing typed by hand. See https://aion2data.com/about.
   - **metabot.gg**: reads the Global client, build 0.0.4387.0 at the time of writing, updated when a patch changes the client. See https://metabot.gg/en/aion-2/methodology.
   - They read the same game files, so they confirm each other for names and descriptions but are not independent for item data. Both say they can contain decoding errors.
2. **In-game checks by the owner** (screenshots, tooltips). Beat everything else when they disagree.
3. **Community guides** (aion2bible.com, the Google Doc above, gameplay.tips, odealo.com). Use for ranking, explanations and anything not in the client data (Pet Genus Insight rolls, stat priority). Prefer guides that say they target Global and are dated within the last weeks. Never use them for what exists on Global.
4. **Official NCSOFT news / patch notes** (aion2data.com/news and /patches mirror them) for what is live, since the client data can contain content that is not released yet.

### What is not in any client-data site
- **Genus Insight** line rolls: only in community guides. The Global ones agree on the useful rolls (gameplay.tips 2 Oct 2026, odealo.com 14 Oct 2026): Special Line 4 Double Chance, Varian Line 4 Front/Back Attack Damage Boost, Fera Line 4 Weapon Damage Boost, Cogni Line 4 Critical Damage Boost, Natura Line 4 Multi-hit Chance or Perfect Chance, Lines 1 and 5 Max Attack then Attack Bonus, Lines 3/6/9 Critical Hit or Accuracy, Line 7 Damage Tolerance or Endurance. They do not list the full roll pools. Shown as dashed tags.
- **Whether Wings are live on Global**: the client data lists 28 wings but the Aion 2 Bible said they were not at launch. Shown as dashed tags until confirmed.
- **Attack Bonus** has no gear or Manastone source in the client data; it only appears on Titles and wings and in the guides' Daevanion notes.

## Cross-checking what exists on Global (do this before claiming a source)
`mise exec -- node scripts/global-sources.mjs` rebuilds `src/data/stat-sources.json` from metabot.gg (`--print` shows it without writing). It reads, for the 15 stats on the Stats page:
- the fixed stats and random-stat pools of the top two gear tiers of every slot,
- the "where to get each stat" table on the stats page (Manastone, Arcana and Daevanion board columns),
- every Title's and Wing's stat lines.
Re-run it after each patch and when adding a stat to the Stats page; commit the JSON. The page builds its "Get it from" tags from it.
- Global armor slots: Shoes, Top, Cloak, Gloves, Legs, Helm, Pauldrons. Accessories: Earrings, Necklace, Ring, Bracelet, Amulet, Belt, Rune. Weapons: Longsword, Greatsword, Dagger, Bow, Mace, Staff, Orb, Spellbook, plus Guard. **No Brooch, no Pendant.**
- Deity (Daevanion) stats come from the Abyssal Bracelet, Arcana and Monolith rewards; Manastones roll Damage Boost, Weapon Damage Boost, Critical Damage Boost, Front/Back Attack Damage Boost and more.
- Mounts also carry tiny Critical Hit / Accuracy lines and Godstones carry no stats; both are left off the tags.
- Limits: only the top two gear tiers are read, so a stat that rolls only on lower tiers can be missed; stats whose names differ between pages need an entry in `ALIAS` in the script.

## Useful reference sites (link out only)
- metabot.gg/en/aion-2/methodology (documents how it reads Global client data tables)
- aion2data.com/about (same, for aion2data), questlog.gg

## Game client (installed on owner's PC)
- Path: `C:\Program Files (x86)\Steam\steamapps\common\AION2` (Unreal Engine, ~84 GB).
- Data lives in `Aion2\Content\Paks` (`.pak`, `.utoc/.ucas`).
- **Pak index is encrypted** (checked footers: encrypted-index flag = 1, pak version 11). Reading data needs the AES key. Decision pending: we do not bypass the encryption or pull keys out of the game executable. Owner must check NCSoft's terms before any extraction.
