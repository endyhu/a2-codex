# Data sources

## Verified Global terms (from data-mined Global-client sources: aion2data.com/stats, metabot.gg/en/aion-2/stats)
- 6 primary stats: Might (raises Attack), Dexterity, Intelligence, Constitution, Precision, Willpower.
- Not Global names: "Smite", "Magic Boost", "Magic Amplification". Do not use them. Use Double Chance, Attack, Damage Boost, Penetration.
- Daevanion stats are "Concept [Deity]", e.g. Justice [Nezekan], Destruction [Zikel], Freedom [Vaizel], Death [Triniel], Illusion [Kaisinel], Wisdom [Lumiel], Life [Yustiel], Destiny [Marchutan], Time [Siel], Space [Israphel].
- "Genus" in the stat data means creature types (Cogni, Fera, Natura, Varian). Check how the Genus *board* system is named in-game before writing the Genus page.
- Caps disagree across sources (Critical Hit 50% vs 80%, Evasion 30% vs 50%). Only publish a cap once confirmed.

## Arcana (Metabot, Global client): 5 slots (Bell, Chalice, Compass, Mirror, Parchment), ~40 cards, 2 sets, cards max level 5. Unconfirmed endgame recipes.

## Useful reference sites (link out only)
- metabot.gg/en/aion-2/methodology (documents how it reads Global client data tables)
- aion2data.com, questlog.gg

## Game client (installed on owner's PC)
- Path: `C:\Program Files (x86)\Steam\steamapps\common\AION2` (Unreal Engine, ~84 GB).
- Data lives in `Aion2\Content\Paks` (`.pak`, `.utoc/.ucas`).
- **Pak index is encrypted** (checked footers: encrypted-index flag = 1, pak version 11). Reading data needs the AES key. Decision pending: we do not bypass the encryption or pull keys out of the game executable. Owner must check NCSoft's terms before any extraction.
