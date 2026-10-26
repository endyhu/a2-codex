// Builds public/market.json: the cheapest listed unit price of every item on every server, from aion2.exchange's public API.
// Last known prices (last[key] = [serverId, price, hours since epoch, ...]) cover items with no listing right now.
// Item volume (items[i][4]): Kinah traded in the API's rolling sales window (units sold x average price). Only the API's default server has sales statistics, so that one server stands in for how much an item matters on every server.
// API: https://aion2.exchange/api/openapi.json (read-only market data, collected hourly there). robots.txt allows /.
// Usage: mise exec -- node scripts/market-snapshot.mjs
// One /api/items call per server (all items in one page), CONCURRENCY at a time, retries on 5xx with exponential backoff; gives up early when the API is clearly down. Writes only if enough servers answered.
import { writeFileSync } from 'node:fs';

const API = 'https://aion2.exchange/api';
const HEADERS = { 'User-Agent': 'a2codex-market-snapshot (+https://a2codex.prezenith.com)' };
const CONCURRENCY = 4;
const MAX_FAILED = 8; // servers that failed all retries before the run is abandoned
const MIN_SERVERS = 0.9;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Early Access (Advanced Access) servers are the first pairs of each region; the API has no field for it. The pair number is the last two digits of server_id. Cross-checked on senseos.gg and neonsect.com (Oct 2026): EU 1-9, NA East 1-3, Asia 1-3, NA West 1-2, Latin America 1-2.
const EA_PAIRS = { EU: 9, NAE: 3, AS: 3, NAW: 2, LA: 2 };
const early = (s) => s.server_id % 100 <= (EA_PAIRS[s.region] ?? 0);

const get = async (path) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(API + path, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
      if (res.ok) return await res.json();
      if (res.status < 500 && res.status !== 429) throw new Error(`${path}: HTTP ${res.status}`);
    } catch (e) {
      if (e.message.startsWith(path)) throw e;
    }
    if (attempt === 5) throw new Error(`${path}: gave up after ${attempt} tries`);
    await sleep(2000 * 2 ** (attempt - 1) + Math.random() * 1000);
  }
};

const { servers, default: defaultServer } = await get('/servers');
const wanted = () => true; // narrow this (e.g. to Europe launch servers) for a quick test run; the pages adapt to whatever servers are in the file
const live = servers.filter((s) => s.has_data && (wanted(s) || s.server_id === defaultServer)); // the default server is always fetched: it is the only one with sales stats
const items = new Map(); // key -> [key, name, section, category]
const prices = {}; // key -> [serverId, price, listings, ...]
const lastRaw = []; // [key, serverId, price, hours since epoch] for items with no listing right now
const updated = {}; // serverId -> latest captured_at
const traded = {}; // key -> Kinah traded on the API's default server
let ok = 0;

// Typical price: median of the cheapest-price points of the last 7 days (the API's /sparklines draws one point per 4 hours, 100 items per call).
// One stray low or high listing right now does not move it. Needs MIN_POINTS points; a failed call just leaves those items without one.
const MIN_POINTS = 6;
const typical = {}; // key -> [serverId, median, ...]
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
const typicalFor = async (server, keys) => {
  for (let i = 0; i < keys.length; i += 100) {
    try {
      const { sparklines } = await get(`/sparklines?window=7d&server=${server}&keys=${keys.slice(i, i + 100).join(',')}`);
      for (const sp of sparklines) {
        const p = sp.points.map((x) => x.price).filter((x) => x != null);
        if (p.length >= MIN_POINTS) (typical[sp.item_key] ??= []).push(server, median(p));
      }
    } catch (e) {
      console.warn(`no typical prices for server ${server}: ${e.message}`);
    }
  }
};

let failed = 0;
let skipped = [];
const queue = [...live];
const worker = async () => {
  for (let s; failed < MAX_FAILED && (s = queue.shift()); ) {
    try {
      const { items: list } = await get(`/items?server=${s.server_id}&limit=1000&sort=key`);
      for (const it of list) {
        if (s.server_id === defaultServer) traded[it.item_key] = Math.round((it.units_sold ?? 0) * (it.sold_avg_price ?? 0));
        if (wanted(s) && !it.listed && it.last_price != null && it.last_seen_at && it.name) lastRaw.push([it.item_key, s.server_id, it.last_price, Math.floor(Date.parse(it.last_seen_at) / 3.6e6)]);
        if (!wanted(s) || !it.listed || it.price == null || !it.name) continue;
        if (!items.has(it.item_key)) items.set(it.item_key, [it.item_key, it.name, it.category.section_id, it.category.name]);
        (prices[it.item_key] ??= []).push(s.server_id, it.price, it.listings);
        if (!updated[s.server_id] || it.captured_at > updated[s.server_id]) updated[s.server_id] = it.captured_at;
      }
      if (wanted(s)) await typicalFor(s.server_id, list.filter((it) => it.listed && it.price != null && it.name).map((it) => it.item_key));
      ok++;
      console.log(`${ok}/${live.length} ${s.name} ${s.server_id}`);
    } catch (e) {
      failed++;
      skipped.push(s);
      console.warn(`skipped server ${s.server_id} ${s.name}: ${e.message}`);
    }
  }
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
// The API's 503s come and go: give servers that failed every retry one more pass, unless the API looks dead.
if (skipped.length && failed < MAX_FAILED) {
  console.log(`retrying ${skipped.length} skipped servers`);
  queue.push(...skipped);
  skipped = [];
  failed = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

if (ok < live.length * MIN_SERVERS) {
  console.error(`only ${ok}/${live.length} servers answered, keeping the old file`);
  process.exit(1);
}
// Last known price (price, hours since epoch) per item and server, only for items that are listed somewhere and were seen within MAX_AGE_DAYS.
const MAX_AGE_DAYS = 60, nowH = Math.floor(Date.now() / 3.6e6);
const last = {};
for (const [key, server, price, h] of lastRaw) if (items.has(key) && nowH - h <= MAX_AGE_DAYS * 24) (last[key] ??= []).push(server, price, h);
const out = {
  generated: new Date().toISOString(),
  servers: live.filter((s) => wanted(s) && updated[s.server_id]).map((s) => [s.server_id, s.name, s.region, s.region_name, s.faction, updated[s.server_id], early(s) ? 1 : 0]),
  items: [...items.values()].map((i) => [...i, traded[i[0]] ?? 0]).sort((a, b) => a[1].localeCompare(b[1])),
  prices,
  typical,
  last,
};
writeFileSync(new URL('../public/market.json', import.meta.url), JSON.stringify(out));
console.log(`${out.servers.length} servers, ${out.items.length} items, ${Object.keys(prices).length} priced, ${Object.keys(last).length} with last prices`);
