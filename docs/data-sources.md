# Data sources

## Verified Global terms (from data-mined Global-client sources: aion2data.com/stats, metabot.gg/en/aion-2/stats)
- 6 primary stats: Might (raises Attack), Dexterity, Intelligence, Constitution, Precision, Willpower.
- Not Global names: "Smite", "Magic Boost", "Magic Amplification". Do not use them. Use Double Chance, Attack, Damage Boost, Penetration.
- Daevanion stats are "Concept [Deity]", e.g. Justice [Nezekan], Destruction [Zikel], Freedom [Vaizel], Death [Triniel], Illusion [Kaisinel], Wisdom [Lumiel], Life [Yustiel], Destiny [Marchutan], Time [Siel], Space [Israphel].
- "Genus" in the stat data means creature types (Cogni, Fera, Natura, Varian). Check how the Genus *board* system is named in-game before writing the Genus page.
- Caps: earlier sources disagreed (Critical Hit 50% vs 80%, Evasion 30% vs 50%). As of 2026-10-23 aion2data and metabot both state Critical Hit 50%, Evasion 30%, Cooldown 60%, MP Cost 60%, Move Speed 150%; aion2data also Immunity 50%. Those are published on the Stats page; an in-game check is still worth doing. Only publish a cap once confirmed.

## Arcana (metabot.gg/en/aion-2/arcana, Global client): 5 slots (Bell, Chalice, Compass, Mirror, Parchment), 2 sets (Primal Vigor, Magic Armor), 40 cards (4 grades each), max level 2 to 5 by grade. Feed values, Transmute costs and card art (Unique only, public/arcana) are from there; Transmute with 2 fixed lines (15 crystals, 5M Kinah) is an in-game check. The Bible has a 10-card chapter that is not Global.

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

## Pantheon page (aion2hub.com)
- Source: aion2hub.com (reads the Global client; item pages say "Global data (Launch Scale Test client, 2026-09-19)"). Its build planner bundle holds a Pantheon module: slots (1 Colossus, 4 Statues, 12 Artworks), the ten deity domains (cap 200 each, each point +10 internal units on two combat stats) and 115 items with type, grade, race (Light = Elyos, Dark = Asmodian, or All) and deity points. Item pages give "How to Obtain" and the icon (`og:image`, assets.playnccdn.com). metabot.gg has no Pantheon page.
- The gamesfuze.com Pantheon guide confirms the slot counts and the Level 22 Ascension quest unlock; it does not explain deity stats.
- No guide ranks Pantheon items for Global, so the page uses our own Stats ranking (see STATUS).

## Market page (aion2.exchange)
- Source: Aion2Market's public read-only API (`https://aion2.exchange/api/openapi.json`, docs at `/api/docs`; robots.txt allows `/`, no terms page found). It polls the in-game market hourly for every server (106 NA/EU/SA/Asia servers, Elyos and Asmodian separately). `/api/items?server=<id>&limit=1000` returns every item with its cheapest unit price and listing count; item names are the Global client's.
- `scripts/market-snapshot.mjs` calls `/api/servers` and then `/api/items` once per server (4 at a time, exponential backoff, one extra pass over skipped servers, identifying User-Agent) and writes `public/market.json` only if at least 90% of servers answered. The API had short 503 "database unavailable" spells, hence the retries.
- Only the API's default server (`default` in `/api/servers`, currently EU Kaisinel) has sales statistics (`units_sold`, `sold_avg_price`); every other server returns null. The snapshot keeps that server's units sold x average price as each item's importance.
- Early Access (Advanced Access) vs launch servers: the API has no field for it. The pair number is the last two digits of `server_id`; Early Access is EU pairs 1-9, NA East 1-3, Asia 1-3, NA West 1-2, Latin America 1-2 (`EA_PAIRS` in the snapshot script, stored as `servers[i][6]`). Source: senseos.gg server list and neonsect.com server guide, which agree (Oct 2026). Re-check if NC opens new Early Access servers.
- Prices are the single cheapest listing, so joke or mistaken listings (one at 500 Kinah next to 56M elsewhere) show up as huge gaps; the Market page counts every listing (its minimum-listings filter was removed by the owner; removed from Crafting too).
- Typical price: `/api/sparklines?window=7d&server=<id>&keys=<up to 100>` returns the cheapest price per 4 hours; the snapshot stores the median per item and server as `typical` (adds about 0.6 MB and ~1500 calls, roughly 6 minutes in total). Servers where this call fails keep current prices only.
- Last known price: each item entry has `last_price` and `last_seen_at` (the last listing, per server). The snapshot stores them as `last[itemKey] = [serverId, price, hours since epoch, ...]` for items with no listing now, seen within 60 days and listed somewhere (full run: 1290 items). The price history endpoint (`/api/items/{key}/prices?bucket=1d`) works but has no CORS header and takes about 2 s, so the history chart was dropped.

## Crafting page (metabot.gg)
- `scripts/crafting-snapshot.mjs` writes `public/crafting.json` from metabot.gg (the Global client's tables): recipes (512, 5 professions: product, output count, mastery, materials) from /crafting; success and combo curves and combo activation from the same page (formula read from its page script: chance = curve[mastery - recipe mastery], capped at the curve end); item levels from the /weapons, /armor, /accessories lists (rows are `data-k="[name, grade, item level, ...]"`); recipe faction from each item page ("Blacksmithing · Lv. 55 · Asmodian", or "Blacksmithing · Asmodian" when no mastery is needed): one row means that faction; for a same-name pair the page header chip is the faction of the lowest product id and the other id gets the opposite faction (the row order on the page is not fixed: it differs for Orichalcum Greatsword). Checked against the market: for the 190 recipes whose product is listed (or last seen) on only one faction's servers, the faction always matches; for all 55 same-name pairs with listings the lower id matches the header faction; NPC shop Kina prices from /shops/<shop> for the crafting, general and substance morph shops (cheapest shop wins). Item type comes from the icon code (weapons, accessories) or the last word of armor names (Breastplate -> Top, Greaves -> Legs, Boots -> Shoes, the Gear page's slot names).
- The 114 "Splendent X" Dragon Lord recipes list only extra materials in the client table; X itself is also an ingredient (owner, in game), added by the snapshot script (quantity 1 assumed). aion2hub.com shows the same table.
- Material prices come from the Market snapshot (`public/market.json`) by item id, including last known prices. "(Bound)" materials are vendor items and have no market price.
- Combo: a craft can also make the "Splendent" version of the item (guides: one grade higher, about 25% on most gear; metabot: "chance that one craft also makes the higher-grade combo result"). The game data does not name the combo result; the page derives it from the name (inferred, see STATUS). Failed crafts: guides (playnews.gg, keengamer.com and others; secondary sources) say the materials of a failed craft are lost, and the combo expected cost assumes so.
- Tools used while building this: metabot.gg pages are server-rendered Next.js (the data sits in `self.__next_f.push` flight chunks); aion2.exchange's `/api/items/{key}/prices` needs `bucket=1d` (not "day") and sends no CORS header.
