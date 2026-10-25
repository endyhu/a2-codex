// Builds public/crafting.json: every crafting recipe of the Global client (product, output count, mastery, profession, materials).
// Source: metabot.gg/en/aion-2/crafting, which converts the Global client's own data tables (see https://metabot.gg/en/aion-2/methodology).
// Usage: mise exec -- node scripts/crafting-snapshot.mjs   (re-run after each patch)
import { writeFileSync } from 'node:fs';

const res = await fetch('https://metabot.gg/en/aion-2/crafting', { headers: { 'User-Agent': 'a2codex-snapshot (a2codex.prezenith.com)' } });
if (!res.ok) throw new Error(`crafting: HTTP ${res.status}`);
// The pages ship their data in Next.js flight chunks: self.__next_f.push([1,"<json string>"]).
const flightOf = (html) => [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map((m) => JSON.parse(m[1])).join('');
const flight = flightOf(await res.text());

// Item level per gear name, from the item lists (rows are data-k="[name, grade, item level, required level, ...]").
const levels = new Map();
for (const list of ['weapons', 'armor', 'accessories']) {
  const r = await fetch(`https://metabot.gg/en/aion-2/${list}`, { headers: { 'User-Agent': 'a2codex-snapshot (a2codex.prezenith.com)' } });
  if (!r.ok) throw new Error(`${list}: HTTP ${r.status}`);
  for (const m of flightOf(await r.text()).matchAll(/"data-k":("(?:[^"\\]|\\.)*")/g)) {
    const [name, , level] = JSON.parse(JSON.parse(m[1]));
    if (typeof level === 'number') levels.set(name, Math.min(level, levels.get(name) ?? level));
  }
}
const at = flight.indexOf('"recipes":[');
if (at < 0) throw new Error('recipes not found in the page');
const open = flight.lastIndexOf('{', at);
let depth = 0, end = open;
for (let i = open; i < flight.length; i++) {
  const c = flight[i];
  if (c === '"') { i++; while (flight[i] !== '"') { if (flight.charCodeAt(i) === 92) i++; i++; } }
  else if (c === '{' || c === '[') depth++;
  else if (c === '}' || c === ']') { if (--depth === 0) { end = i; break; } }
}
const props = JSON.parse(flight.slice(open, end + 1));

// Sub-filter: weapons and accessories by the icon code, armor by the last word of the name (Boots, Pauldrons, ...).
const TYPES = {
  wp_da: 'Daggers', wp_gs: 'Greatswords', wp_ma: 'Maces', wp_sw: 'Swords', weapon_guarder: 'Guards', wp_mb: 'Spellbooks', wp_or: 'Orbs',
  wp_bw: 'Bows', wp_st: 'Staves', acc_er: 'Earrings', acc_nl: 'Necklaces', acc_ring: 'Rings', acc_bracelet: 'Bracelets',
  item_craft: 'Components',
};
// Armor item names to the slot names the Gear page uses.
const SLOTS = { Breastplate: 'Top', Greaves: 'Legs', Boots: 'Shoes' };
const typeOf =(r) => {
  const it = props.items[r.product], code = it.icon.match(/icon_(wp_[a-z]+|acc_[a-z]+|weapon_guarder|item_craft|item_usable|gm)/i)?.[1] ?? it.icon.match(/(weapon_guarder|item_craft|item_usable)/)?.[1];
  if (code === 'item_usable') return r.category === 'Cooking' ? 'Food' : 'Consumables';
  if (code === 'gm') return SLOTS[it.name.split(' ').pop()] ?? it.name.split(' ').pop();
  return TYPES[code] ?? 'Other';
};

const textOf = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n').split('\n').map((s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").trim()).filter(Boolean);

const used = new Set();
const recipes = props.recipes.map((r) => {
  used.add(r.product);
  r.parts.forEach(([id]) => used.add(id));
  return { product: r.product, qty: r.qty, mastery: r.mastery, profession: r.category, level: levels.get(props.items[r.product].name), type: typeOf(r), combo: r.combo, rate: r.rate, parts: r.parts };
});
const items = {};
for (const id of [...used].sort((a, b) => a - b)) {
  const it = props.items[id];
  if (!it) throw new Error(`item ${id} has no name`);
  items[id] = [it.name, it.grade];
}

// Faction of each recipe, from the item pages' recipe rows ("Blacksmithing · Lv. 55 · Asmodian", or "Blacksmithing · Asmodian" when no mastery is needed). A page lists one row for a
// faction-only item and one row per faction for an item both factions craft; the rows follow the product ids in ascending order
// (inferred: Elyos is the lower id, e.g. Artisan's Yggdrasil Bow 110440013 Elyos, Artisan's Asvata Bow 110440015 Asmodian).
const byHref = new Map();
for (const r of recipes) (byHref.get(props.items[r.product].href) ?? byHref.set(props.items[r.product].href, []).get(props.items[r.product].href)).push(r);
const hrefs = [...byHref.keys()];
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  for (let h; (h = hrefs[next++]); ) {
    const res = await fetch('https://metabot.gg/en/aion-2' + h.replace(/^\/aion-2/, ''), { headers: { 'User-Agent': 'a2codex-snapshot (a2codex.prezenith.com)' } });
    if (!res.ok) { console.warn(`faction: ${h} HTTP ${res.status}`); continue; }
    const rows = textOf(await res.text()).map((l) => l.match(/^[A-Za-z]+(?: · Lv\. \d+)? · (Elyos|Asmodian)$/)?.[1]).filter(Boolean);
    const rs = byHref.get(h).sort((a, b) => a.product - b.product);
    const uniq = [...new Set(rows)];
    if (uniq.length === 1) rs.forEach((r) => (r.faction = uniq[0]));
    else if (rows.length === rs.length) rs.forEach((r, i) => (r.faction = rows[i]));
  }
}));
console.log('faction-specific recipes:', recipes.filter((r) => r.faction).length);

// Kina prices of NPC shops, for materials that are only bought from merchants (the "(Bound)" items). Cheapest shop wins.
// Shop pages list rows as: name | grade | price | currency (some shops add a faction column), between the "Price" header and "Where to find it".
const byName = new Map(Object.entries(items).map(([id, [name]]) => [name, id]));
const vendor = {};
const GRADES = new Set(['Common', 'Rare', 'Legend', 'Unique']);
for (const slug of ['blacksmithing-shop', 'alchemy-shop', 'handicrafting-shop', 'armorsmithing-shop', 'cooking-shop', 'substance-morph-shop', 'general-shop']) {
  const r = await fetch(`https://metabot.gg/en/aion-2/shops/${slug}`, { headers: { 'User-Agent': 'a2codex-snapshot (a2codex.prezenith.com)' } });
  if (!r.ok) throw new Error(`${slug}: HTTP ${r.status}`);
  const t = textOf(await r.text());
  const from = t.indexOf('Price', t.indexOf('Items for sale', t.indexOf('Items for sale') + 1)) + 1, to = t.indexOf('Where to find it');
  for (let i = from + 1; i < to; i++) {
    if (!GRADES.has(t[i])) continue;
    const [name, price, currency] = [t[i - 1], t[i + 1], t[i + 2]];
    const id = byName.get(name);
    if (currency === 'Kina' && id && /^[0-9,]+$/.test(price)) vendor[id] = Math.min(vendor[id] ?? Infinity, Number(price.replace(/,/g, '')));
  }
}

writeFileSync(new URL('../public/crafting.json', import.meta.url), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), items, vendor, curves: props.curves, recipes }));
console.log(`${recipes.length} recipes, ${Object.keys(items).length} items`);
