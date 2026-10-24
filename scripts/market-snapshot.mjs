// Builds public/market.json: the cheapest listed unit price of every item on every server, from aion2.exchange's public API.
// API: https://aion2.exchange/api/openapi.json (read-only market data, collected hourly there). robots.txt allows /.
// Usage: mise exec -- node scripts/market-snapshot.mjs
// One /api/items call per server (all items in one page), sequential with a pause, retries on 5xx. Writes only if enough servers answered.
import { writeFileSync } from 'node:fs';

const API = 'https://aion2.exchange/api';
const HEADERS = { 'User-Agent': 'a2codex-market-snapshot (+https://a2codex.prezenith.com)' };
const PAUSE_MS = 400;
const MIN_SERVERS = 0.9;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const get = async (path) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(API + path, { headers: HEADERS, signal: AbortSignal.timeout(30000) });
      if (res.ok) return await res.json();
      if (res.status < 500 && res.status !== 429) throw new Error(`${path}: HTTP ${res.status}`);
    } catch (e) {
      if (e.message.startsWith(path)) throw e;
    }
    if (attempt === 6) throw new Error(`${path}: gave up after ${attempt} tries`);
    await sleep(attempt * 5000);
  }
};

const { servers } = await get('/servers');
const live = servers.filter((s) => s.has_data);
const items = new Map(); // key -> [key, name, section, category]
const prices = {}; // key -> [serverId, price, listings, ...]
const updated = {}; // serverId -> latest captured_at
let ok = 0;

for (const s of live) {
  try {
    const { items: list } = await get(`/items?server=${s.server_id}&limit=1000&sort=key`);
    for (const it of list) {
      if (!it.listed || it.price == null || !it.name) continue;
      if (!items.has(it.item_key)) items.set(it.item_key, [it.item_key, it.name, it.category.section_id, it.category.name]);
      (prices[it.item_key] ??= []).push(s.server_id, it.price, it.listings);
      if (!updated[s.server_id] || it.captured_at > updated[s.server_id]) updated[s.server_id] = it.captured_at;
    }
    ok++;
  } catch (e) {
    console.warn(`skipped server ${s.server_id} ${s.name}: ${e.message}`);
  }
  await sleep(PAUSE_MS);
}

if (ok < live.length * MIN_SERVERS) {
  console.error(`only ${ok}/${live.length} servers answered, keeping the old file`);
  process.exit(1);
}
const out = {
  generated: new Date().toISOString(),
  servers: live.filter((s) => updated[s.server_id]).map((s) => [s.server_id, s.name, s.region, s.region_name, s.faction, updated[s.server_id]]),
  items: [...items.values()].sort((a, b) => a[1].localeCompare(b[1])),
  prices,
};
writeFileSync(new URL('../public/market.json', import.meta.url), JSON.stringify(out));
console.log(`${out.servers.length} servers, ${out.items.length} items, ${Object.keys(prices).length} priced`);
