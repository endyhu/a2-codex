// Builds src/data/stat-sources.json: where each stat on the Stats page can be obtained, read from the Global client.
// Source: metabot.gg, which converts the Global client's own data tables (see https://metabot.gg/en/aion-2/methodology).
// Usage: mise exec -- node scripts/global-sources.mjs          (writes the JSON and prints a summary)
//        mise exec -- node scripts/global-sources.mjs --print  (summary only, writes nothing)
// Systems covered: gear (fixed + random stat pools of the top two gear tiers), Manastones, Daevanion boards, Arcana,
// Titles, Wings. Pet Genus Insight is not in any client-data site; it is maintained by hand in stats.astro.
import { writeFileSync } from 'node:fs';

const BASE = 'https://metabot.gg/en/aion-2/';
const STATS = [
  'Double Chance', 'Combat Speed', 'Front / Back Attack Damage Boost', 'Weapon Damage Boost', 'Critical Damage Boost',
  'Damage Boost', 'Multi-hit Chance', 'Perfect Chance', 'Cooldown', 'Attack', 'Max Attack', 'Attack Bonus', 'Accuracy',
  'Critical Hit', 'Endurance',
];
// Names the client uses on some pages for the same stat.
const ALIAS = {
  'Cooldown Reduction': 'Cooldown',
  'Front Attack Damage Boost': 'Front / Back Attack Damage Boost',
  'Back Attack Damage Boost': 'Front / Back Attack Damage Boost',
};
const canon = (n) => ALIAS[n] ?? n;

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").trim();
const page = async (path) => {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.text();
};
const lines = (html) =>
  html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n').split('\n').map(text).filter(Boolean);
// "Critical Hit +60" -> "Critical Hit"; also handles "+10: Flight Power +300".
const statName = (seg) => seg.replace(/^\+\d+:\s*/, '').match(/^([A-Za-z][A-Za-z' \-/]+?)\s+[+\-−][\d.,]+%?$/)?.[1];
const namesIn = (ls) => {
  const found = new Set();
  for (const l of ls) for (const seg of l.split(/,\s*/)) { const n = statName(seg.trim()); if (n) found.add(canon(n)); }
  return found;
};

// --- Gear: fixed stats and random-stat pools of the top two tiers of every slot ---
const SLOTS = {
  armor: { Helm: 'helm', Pauldrons: 'pauldrons', Top: 'breastplate', Cloak: 'cloak', Gloves: 'gloves', Legs: 'greaves', Shoes: 'boots' },
  weapons: { Longsword: 'longsword', Greatsword: 'greatsword', Dagger: 'dagger', Bow: 'bow', Mace: 'mace', Staff: 'staff', Orb: 'orb', Spellbook: 'spellbook', Guard: 'guard' },
  accessories: { Earrings: 'earrings', Necklace: 'necklace', Ring: 'ring' },
};
const SINGLES = { Bracelet: 'abyssal-bracelet', Amulet: 'revelation-amulet', Belt: 'noble-belt', Rune: 'clash-rune' };
const TIERS = ['splendent-ebony-dragon-lord-', 'ebony-dragon-lord-'];

const gear = {}; // stat -> Set of slot names
const addGear = (stat, slot) => (gear[stat] ??= new Set()).add(slot);
const readItem = async (slot, slug) => {
  const res = await fetch(BASE + 'items/' + slug);
  if (!res.ok) return;
  const html = await res.text();
  const rStart = html.indexOf('Random stats');
  const rBlock = rStart > 0 ? html.slice(rStart, html.indexOf('Random skill options', rStart) > 0 ? html.indexOf('Random skill options', rStart) : rStart + 20000) : '';
  const fStart = html.indexOf('Fixed stats come with');
  const fBlock = fStart > 0 ? html.slice(fStart, rStart > fStart ? rStart : fStart + 12000) : '';
  for (const m of rBlock.matchAll(/<th scope="row">(.*?)<\/th>/g)) addGear(canon(text(m[1])), slot);
  for (const m of fBlock.matchAll(/<dt[^>]*>(.*?)<\/dt>/g)) addGear(canon(text(m[1])), slot);
};
for (const group of Object.values(SLOTS))
  for (const [slot, key] of Object.entries(group)) for (const tier of TIERS) await readItem(slot, tier + key);
for (const [slot, slug] of Object.entries(SINGLES)) await readItem(slot, slug);

const slotLabels = (stat) => {
  const has = gear[stat] ?? new Set();
  const armor = Object.keys(SLOTS.armor).filter((s) => has.has(s));
  const weapons = Object.keys(SLOTS.weapons).filter((s) => has.has(s));
  const acc = [...Object.keys(SLOTS.accessories), ...Object.keys(SINGLES)].filter((s) => has.has(s));
  // Armor and weapons collapse into one label; accessories are always listed one by one, because the Amulet, Belt and
  // Rune rarely roll the same stats as the Earrings, Necklace and Ring, so a blanket "All gear" would be wrong.
  const allArmor = armor.length === 7;
  const allWeapons = weapons.length >= 8;
  return [...(allArmor ? ['All armor'] : armor), ...(allWeapons ? ['Weapons'] : weapons), ...acc];
};

// --- The stats page's "where to get each stat" table: best gear, best Arcana, Manastone and Daevanion columns ---
const statsHtml = await page('stats');
const table = {};
for (const row of statsHtml.matchAll(/<tr><th scope="row"><b>(.*?)<\/b><\/th>([\s\S]*?)<\/tr>/g)) {
  const cells = [...row[2].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => text(c[1]));
  if (cells.length >= 4) table[canon(text(row[1]))] = { arcana: cells[1], manastone: cells[2], daevanion: cells[3] };
}
const has = (cell) => !!cell && cell !== '—';

// --- Titles and Wings ---
const count = (ls, stat) => ls.filter((l) => l.split(/,\s*/).some((seg) => canon(statName(seg.trim()) ?? '') === stat)).length;
const titleLines = lines(await page('titles'));
const wingLines = lines(await page('wings'));

const build = (await page('methodology')).match(/0\.0\.\d{3,5}\.\d/)?.[0] ?? 'unknown';
const out = { generatedAt: new Date().toISOString().slice(0, 10), clientBuild: build, source: 'metabot.gg (Global client data tables)', stats: {} };
for (const stat of STATS) {
  const t = table[stat] ?? {};
  out.stats[stat] = {
    gear: slotLabels(stat),
    manastone: has(t.manastone),
    daevanion: has(t.daevanion),
    arcana: has(t.arcana),
    titles: count(titleLines, stat),
    wings: count(wingLines, stat),
  };
}

for (const [stat, v] of Object.entries(out.stats))
  console.log(`${stat}: gear [${v.gear.join(', ')}]${v.manastone ? ' + Manastone' : ''}${v.daevanion ? ' + Daevanion' : ''}${v.arcana ? ' + Arcana card' : ''} | titles ${v.titles} | wings ${v.wings}`);
console.log(`client build ${build}, ${titleLines.length} title lines, ${wingLines.length} wing lines`);

if (!process.argv.includes('--print')) {
  writeFileSync(new URL('../src/data/stat-sources.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
  console.log('wrote src/data/stat-sources.json');
}
