// Pantheon decorations of the Global client -> src/data/pantheon.json and src/assets/pantheon/<item>.webp
// Data: aion2hub.com's build planner bundle (module "pantheon": slots, deity domains with caps and conversions, 115 items),
// item pages for "How to Obtain" and the icon (NC's CDN). Re-run after patches: mise exec -- node scripts/pantheon-snapshot.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const HUB = 'https://aion2hub.com';
const UA = { 'user-agent': 'a2codex-snapshot (cheatsheet site; contact via repo)' };
const root = path.resolve(import.meta.dirname, '..');
const outJson = path.join(root, 'src/data/pantheon.json');
const outImg = path.join(root, 'src/assets/pantheon');

const get = async (url, tries = 4) => {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return r;
    } catch {}
    await new Promise((r) => setTimeout(r, 800 * 2 ** i));
  }
  throw new Error('failed: ' + url);
};

// 1. The planner bundle holds the Pantheon JSON as a JSON.parse('...') module.
const page = await (await get(`${HUB}/tools/build-calculator`)).text();
const chunks = [...new Set(page.match(/\/_next\/static\/chunks\/[\w.-]+\.js/g))];
let data;
for (const c of chunks) {
  const js = await (await get(HUB + c)).text();
  const m = /\(a,e,t\)=>\{e\.exports=JSON\.parse\('(\{"builtAt":"[^"]*","slots":\{"Large".*?)'\)\}/s.exec(js);
  if (!m) continue;
  data = JSON.parse(m[1].replace(/\\'/g, "'"));
  break;
}
if (!data) throw new Error('Pantheon module not found in the planner bundle');

// 2. Item pages: icon and sources.
const text = (h) => h.replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, '|').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
const sources = (html) => {
  const at = html.indexOf('How to Obtain');
  if (at < 0) return [];
  const body = html.slice(at, html.indexOf('Item #', at));
  const out = [];
  // Each source group: a coloured label, then <li> rows whose first span is the name and a "Lv N" chip.
  for (const g of body.split('<span class="h-2 w-2 rounded-full"').slice(1)) {
    const kind = text(/uppercase tracking-\[0\.15em\][^>]*>(.*?)<\/span>/s.exec(g)?.[1] ?? '').replace(/\|/g, '').trim();
    const rows = [...g.matchAll(/<li[^>]*>(.*?)<\/li>/gs)].map((m) => {
      const t = text(m[1]).split('|').map((s) => s.trim()).filter(Boolean);
      const lv = t.find((s) => /^Lv \d+/.test(s));
      return { name: t[0], lv: lv ? Number(lv.slice(3)) : undefined, extra: t.filter((s) => s !== t[0] && s !== lv && !/^(named|world boss)$/i.test(s)).slice(0, 1) };
    });
    const names = [];
    for (const r of rows) if (!names.some((n) => n.name === r.name)) names.push({ name: r.name, lv: r.lv });
    out.push({ kind, names: names.slice(0, 3), more: Math.max(0, names.length - 3) });
  }
  return out;
};

fs.mkdirSync(outImg, { recursive: true });
const items = [];
const queue = [...data.items];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let it; (it = queue.shift()); ) {
    const html = await (await get(`${HUB}/database/items/${it.item}`)).text();
    const icon = /og:image" content="([^"]+)"/.exec(html)?.[1];
    if (icon) {
      const buf = Buffer.from(await (await get(icon)).arrayBuffer());
      await sharp(buf).resize(160, 160).webp({ quality: 82 }).toFile(path.join(outImg, `${it.item}.webp`));
    }
    items.push({
      id: it.decoId, item: it.item, type: it.uiType, grade: it.grade, name: it.name.replace(/\\'/g, "'"),
      race: it.race === 'Light' ? 'Elyos' : it.race === 'Dark' ? 'Asmodian' : 'All',
      domains: it.domains, from: sources(html), icon: !!icon,
    });
  }
}));
items.sort((a, b) => a.id - b.id);

fs.writeFileSync(outJson, JSON.stringify({ builtAt: data.builtAt, slots: data.slots, domains: data.domains, items }, null, 1) + '\n');
console.log(`${items.length} items, ${items.filter((i) => i.icon).length} icons, ${items.filter((i) => !i.from.length).length} without a source`);
