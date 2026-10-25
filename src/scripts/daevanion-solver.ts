// Exact Daevanion route solver, ported from the standalone optimizer (same algorithm, same results).
// Problem: on each board pick a connected set of tiles that contains the start tile, spends at most the pool's crystals,
// and maximises the lexicographic tier vector sum(node.w). Lexicographic order is compatible with addition, so both steps are exact:
//  1. Per board: connectivity-frontier dynamic programming. Tiles are swept in a fixed order; a state records which frontier tiles
//     are selected and which of them are already connected. Boards are sparse corridors, so only a few thousand states exist per layer.
//     For every crystal cost the best route is recovered.
//  2. Per pool: boards that share a crystal pool are combined with a multiple-choice knapsack over their (cost -> best route) tables.

export type Pool = 'c' | 'q' | 'a';
export type Mode = 'pve' | 'pvp';
export type Effect = [string, number];
export interface RawBoard { n: string; p: Pool; nodes: (string | number)[][] }
export interface Node { r: number; c: number; cost: number; e: Effect[]; adj: number[]; j: number; w: Float64Array }
export interface Board { n: string; p: Pool; N: Node[]; start: number; idx: Record<number, Node>; plan?: Plan }
export interface GameData { classes: Record<string, RawBoard[]>; lab: Record<string, string>; pct: string[]; ref: Record<string, number>; skc: Record<string, string>; icons: Record<string, string> }

// Crystal pools in the game's board order: c = Daevanion crystal (standard boards), q = Conquest crystal (Ariel), a = Battle crystal (Azphel).
export const POOLS: Pool[] = ['c', 'q', 'a'];
const EPS = 1e-9;
// States allowed per board plan; guards memory on unexpected layouts.
const PLAN_HARD_CAP = 1500000;

// Fixed stat orders, best first. Standard boards: Attack Bonus and Critical Hit have their own tiers, the rest follow.
export const STAT_ORDER = ['fixingdamage', 'critical', 'hpmax', 'defense', 'criticalresist', 'mpmax'];
const AZPHEL_STAT_ORDER = ['pvpadddamage', 'pvpcritical', 'pvpaccuracy', 'abnormalaccuracy', 'abnormalresistance', 'hpmax', 'pvpdamagedefense', 'pvpcriticalresist', 'pvpevasion', 'mpmax'];
const ARIEL_STAT_ORDER = ['pveadddamage', 'critical', 'bossnpcadddamage', 'bossnpcamplifydamage', 'pveaccuracy', 'hpmax', 'pvedamagedefense', 'bossnpcdefense', 'bossnpcdecreasedamage', 'criticalresist', 'pveevasion', 'mpmax'];
// Order stat totals are listed in: standard stats first, then Azphel's, then Ariel's.
export const STAT_RANK = [...new Set([...STAT_ORDER, ...AZPHEL_STAT_ORDER, ...ARIEL_STAT_ORDER])];
const PINNED_STATS =['fixingdamage', 'critical'];
// Weight falloff per rank for the remaining PvE standard stats, chosen so several lower-ranked gains can beat one repeated higher-ranked gain.
const SOFT_RANK_DECAY = 0.72;
// In PvE these orange rewards score nothing.
const PVE_NO_VALUE_ORANGE: Record<string, Set<string>> = { Triniel: new Set(['additionalhitresistrate']), Vaizel: new Set(['decreasecriticaldamage']) };

export const isSkill = (k: string) => k.startsWith('s:');
export const isIgnoredOrange = (b: Board, o: Node, mode: Mode) =>
  mode === 'pve' && o.cost === 4 && b.p === 'c' && o.e.some(([k]) => PVE_NO_VALUE_ORANGE[b.n]?.has(k));

// Raw board data to nodes with 4-neighbour adjacency. Nodes are indexed by row * 20 + column.
export function prep(b: RawBoard): Board {
  const idx: Record<number, Node> = {};
  const N = b.nodes.map((a, i) => {
    const e: Effect[] = [];
    for (let q = 3; q < a.length; q += 2) e.push([a[q] as string, a[q + 1] as number]);
    const o: Node = { r: a[0] as number, c: a[1] as number, cost: a[2] as number, e, adj: [], j: i, w: new Float64Array(0) };
    idx[o.r * 20 + o.c] = o;
    return o;
  });
  N.forEach((o) => {
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const t = idx[(o.r + dr) * 20 + o.c + dc];
      if (t) o.adj.push(t.j);
    }
  });
  return { n: b.n, p: b.p, N, start: N.findIndex((o) => o.cost === 0), idx };
}

// Scoring: every tile gets a weight vector (one slot per tier) and the solver maximises it lexicographically,
// so an earlier tier always beats any amount of a later one. Tier order:
//   Azphel orange (2) · Ariel orange (2) · must-have actives (1 each) · orange · must-have passives (1 each) · Attack Bonus · Critical Hit
//   · other passives · other actives · remaining stats.
// PvE scores the remaining standard stats in one soft-weighted tier; PvP gives each its own strict tier and counts every orange.
// Azphel and Ariel stats always get one strict tier per stat. Each pool is solved on its own, so pools may share tier slots.
// Ignored skills score nothing, so they are never a reason to take a tile.
export function weigh(boards: Board[], mode: Mode, mustHave: string[], D: GameData, ignored: string[] = []) {
  const pvp = mode === 'pvp';
  const AZPHEL_ATTACK = 0, AZPHEL_DEFENSE = 1, ARIEL_ATTACK = 2, ARIEL_DEFENSE = 3, keyStart = 4;
  // The Aion 2 Bible: key actives first, then the important orange tiles; key passives come after.
  const isActive = (k: string) => D.skc[k.slice(2)] === 'active';
  const keyActives = mustHave.filter(isActive), keyPassives = mustHave.filter((k) => !isActive(k));
  const orange = keyStart + keyActives.length, passiveStart = orange + 1, attack = passiveStart + keyPassives.length;
  const crit = attack + 1, otherPassive = attack + 2, otherActive = attack + 3, statStart = attack + 4;
  const T = statStart + Math.max(STAT_ORDER.length, AZPHEL_STAT_ORDER.length, ARIEL_STAT_ORDER.length);
  const keyTier = Object.fromEntries([...keyActives.map((k, i) => [k, keyStart + i]), ...keyPassives.map((k, i) => [k, passiveStart + i])]);
  const present = (pool: Pool) => {
    const s = new Set<string>();
    for (const b of boards) if (b.p === pool) for (const o of b.N) if (o.cost && o.cost < 4) for (const [k] of o.e) if (!isSkill(k)) s.add(k);
    return s;
  };
  const orders: Record<Pool, string[]> = {
    c: STAT_ORDER,
    a: AZPHEL_STAT_ORDER.filter((k) => present('a').has(k)),
    q: ARIEL_STAT_ORDER.filter((k) => present('q').has(k)),
  };
  const soft = STAT_ORDER.filter((k) => !PINNED_STATS.includes(k));
  for (const b of boards) for (const o of b.N) {
    o.w = new Float64Array(T);
    if (!o.cost) continue;
    if (o.cost === 4) {
      const has = (key: string) => o.e.some(([k]) => k === key);
      if (b.p === 'a') o.w[has('pvpamplifydamage') ? AZPHEL_ATTACK : AZPHEL_DEFENSE] = 1;
      else if (b.p === 'q') o.w[has('pveamplifydamage') ? ARIEL_ATTACK : ARIEL_DEFENSE] = 1;
      else if (!isIgnoredOrange(b, o, mode)) o.w[orange] = 1;
      continue;
    }
    for (const [k, x] of o.e) {
      if (isSkill(k)) {
        if (ignored.includes(k)) continue;
        const active = D.skc[k.slice(2)] === 'active';
        o.w[keyTier[k] ?? (active ? otherActive : otherPassive)] += x;
        continue;
      }
      const std = b.p === 'c', i = orders[b.p].indexOf(k);
      if (std && k === 'fixingdamage') o.w[attack] += x / D.ref[k];
      else if (std && k === 'critical') o.w[crit] += x / D.ref[k];
      else if (std && !pvp && i >= 0) o.w[statStart] += (x / D.ref[k]) * Math.pow(SOFT_RANK_DECAY, soft.indexOf(k));
      else if (i >= 0) o.w[statStart + i] += x / D.ref[k];
    }
  }
  return T;
}

// Sweep orders for the frontier plan.
function greedyOrder(adj: number[][], start: number, coords: number[][], farFirst: boolean) {
  const n = adj.length, done = new Uint8Array(n), rem = adj.map((a) => a.length), order = [start];
  done[start] = 1;
  for (const u of adj[start]) rem[u]--;
  let f = rem[start] > 0 ? 1 : 0;
  const [sr, sc] = coords[start], dist = coords.map(([r, c]) => Math.abs(r - sr) + Math.abs(c - sc));
  while (order.length < n) {
    let best = -1, bf = 0, bn = 0, bd = 0;
    // Grow the processed region so the frontier stays small. Ties: more processed neighbours, then (optionally) farther from the start.
    const consider = (v: number) => {
      let doneN = 0, closes = 0;
      for (const u of adj[v]) if (done[u]) { doneN++; if (rem[u] === 1) closes++; }
      const nf = f + (rem[v] > 0 ? 1 : 0) - closes, d = farFirst ? dist[v] : 0;
      if (best < 0 || nf < bf || (nf === bf && (doneN > bn || (doneN === bn && d > bd)))) { best = v; bf = nf; bn = doneN; bd = d; }
    };
    let any = false;
    for (let v = 0; v < n; v++) if (!done[v] && adj[v].some((u) => done[u])) { consider(v); any = true; }
    if (!any) for (let v = 0; v < n; v++) if (!done[v]) { consider(v); break; }
    const closes = adj[best].filter((u) => done[u] && rem[u] === 1).length;
    f = f + (rem[best] > 0 ? 1 : 0) - closes;
    done[best] = 1;
    for (const u of adj[best]) rem[u]--;
    order.push(best);
  }
  return order;
}
function sweepOrder(coords: number[][], start: number, byRow: boolean) {
  const rest: number[] = [];
  for (let i = 0; i < coords.length; i++) if (i !== start) rest.push(i);
  rest.sort((a, b) => (byRow ? coords[a][0] - coords[b][0] || coords[a][1] - coords[b][1] : coords[a][1] - coords[b][1] || coords[a][0] - coords[b][0]));
  return [start, ...rest];
}

// Frontier state plan: weight independent, so it is cached per board layout.
interface Layer { v: number; nPrev: number; nNew: number; trans: Int32Array }
interface Plan { order: number[]; layers: Layer[]; total: number; maxStates: number }
function buildPlan(adj: number[][], start: number, order: number[], limit: number): Plan | null {
  const n = adj.length, pos = new Int32Array(n);
  for (let i = 0; i < n; i++) pos[order[i]] = i;
  const last = new Int32Array(n);
  for (let v = 0; v < n; v++) { let m = pos[v]; for (const u of adj[v]) if (pos[u] > m) m = pos[u]; last[v] = m; }
  const adjSet = adj.map((a) => new Set(a));
  let F: number[] = [], cur: number[][] = [[]], total = 1, maxStates = 1;
  const layers: Layer[] = [];
  for (let t = 0; t < n; t++) {
    const v = order[t], newF = F.concat([v]), nbr: number[] = [];
    F.forEach((u, i) => { if (adjSet[v].has(u)) nbr.push(i); });
    const keep: number[] = [], forget: number[] = [];
    newF.forEach((u, i) => { (last[u] > t ? keep : forget).push(i); });
    const map = new Map<string, number>(), next: number[][] = [], trans = new Int32Array(cur.length * 2).fill(-1);
    for (let si = 0; si < cur.length; si++) {
      const L = cur[si];
      for (let c = v === start ? 1 : 0; c < 2; c++) {
        const lab = L.slice();
        lab.push(0);
        if (c) {
          let x: number;
          if (v === start) x = 1;
          else {
            const ids: number[] = [];
            for (const i of nbr) { const l = L[i]; if (l && !ids.includes(l)) ids.push(l); }
            if (!ids.length) {
              if (!L.includes(1)) continue;            // main route already sealed
              let mx = 0;
              for (const l of L) if (l > mx) mx = l;
              x = mx + 1;
            } else {
              x = Math.min(...ids);
              for (let i = 0; i < lab.length; i++) if (ids.includes(lab[i])) lab[i] = x;
            }
          }
          lab[lab.length - 1] = x;
        }
        let ok = true;
        for (const i of forget) {
          const comp = lab[i];
          if (!comp) continue;
          let alive = false;
          for (const j of keep) if (lab[j] === comp) { alive = true; break; }
          if (alive) continue;
          if (comp !== 1) { ok = false; break; }       // orphan component can never reach the start
          for (const j of keep) if (lab[j] !== 0) { ok = false; break; }
          if (!ok) break;
        }
        if (!ok) continue;
        const rm = new Map<number, number>([[1, 1]]);
        let nx = 2;
        const nl = new Array<number>(keep.length);
        for (let q = 0; q < keep.length; q++) {
          const l = lab[keep[q]];
          if (!l) { nl[q] = 0; continue; }
          let r = rm.get(l);
          if (r === undefined) { r = nx++; rm.set(l, r); }
          nl[q] = r;
        }
        const key = String.fromCharCode.apply(null, nl.map((x) => x + 48));
        let id = map.get(key);
        if (id === undefined) { id = next.length; map.set(key, id); next.push(nl); }
        trans[si * 2 + c] = id;
      }
    }
    layers.push({ v, nPrev: cur.length, nNew: next.length, trans });
    total += next.length;
    if (next.length > maxStates) maxStates = next.length;
    if (total > limit) return null;
    F = keep.map((i) => newF[i]);
    cur = next;
  }
  return { order, layers, total, maxStates };
}
const planCache = new Map<string, Plan>();
function getPlan(b: Board) {
  if (b.plan) return b.plan;
  const adj = b.N.map((o) => o.adj);
  const key = adj.map((a) => a.join(',')).join('|') + '#' + b.start;
  let plan = planCache.get(key);
  if (!plan) {
    const coords = b.N.map((o) => [o.r, o.c]);
    let limit = PLAN_HARD_CAP;
    const tryOrder = (order: number[]) => {
      const p = buildPlan(adj, b.start, order, limit);
      if (p && (!plan || p.total < plan.total)) { plan = p; limit = p.total; }
    };
    // Greedy orders (two tie-breaks) win on every shipped board; plain sweeps are a fallback.
    tryOrder(greedyOrder(adj, b.start, coords, false));
    tryOrder(greedyOrder(adj, b.start, coords, true));
    if (!plan || plan.total > 200000) {
      tryOrder(sweepOrder(coords, b.start, true));
      tryOrder(sweepOrder(coords, b.start, false));
    }
    if (!plan) throw new Error('Board layout is too complex for the exact solver.');
    planCache.set(key, plan);
  }
  b.plan = plan;
  return plan;
}

// Pack the lexicographic tier vector into as few doubles as possible: runs of integer tiers share one 52-bit word; fractional tiers get a word of their own.
function packBoard(b: Board, T: number) {
  const n = b.N.length;
  const tiers: { t: number; isInt: boolean; bits: number }[] = [];
  for (let t = 0; t < T; t++) {
    let any = false, isInt = true, sum = 0;
    for (const o of b.N) {
      const x = o.w[t];
      if (x > EPS) { any = true; if (Math.abs(x - Math.round(x)) > 1e-9) isInt = false; sum += Math.round(x); }
    }
    if (any) tiers.push({ t, isInt, bits: isInt ? Math.max(1, Math.ceil(Math.log2(sum + 1))) : 0 });
  }
  type Word = { float: boolean; tiers: typeof tiers; bits?: number };
  const words: Word[] = [];
  let cur: Word | null = null;
  const flush = () => { if (cur && cur.tiers.length) words.push(cur); cur = null; };
  for (const tr of tiers) {
    if (!tr.isInt) { flush(); words.push({ float: true, tiers: [tr] }); continue; }
    if (cur && cur.bits! + tr.bits > 52) flush();
    if (!cur) cur = { float: false, tiers: [], bits: 0 };
    cur.tiers.push(tr);
    cur.bits! += tr.bits;
  }
  flush();
  const W = Math.max(1, words.length), nodeWords = new Float64Array(n * W);
  words.forEach((word, wi) => {
    if (word.float) {
      const t = word.tiers[0].t;
      for (let i = 0; i < n; i++) nodeWords[i * W + wi] = b.N[i].w[t];
      return;
    }
    let shift = 0;
    for (let q = word.tiers.length - 1; q >= 0; q--) {
      const tr = word.tiers[q], mul = Math.pow(2, shift);
      for (let i = 0; i < n; i++) nodeWords[i * W + wi] += Math.round(b.N[i].w[tr.t]) * mul;
      shift += tr.bits;
    }
  });
  return { W, nodeWords };
}

const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const vecCmp = (a: ArrayLike<number>, b: ArrayLike<number>) => { for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; if (d > EPS) return 1; if (d < -EPS) return -1; } return 0; };
// How long the solver may run before it hands control back to the page (ms).
const YIELD_AFTER = 40;

interface Option { cost: number; S: Uint8Array; v: Float64Array }

// Per-board DP: best route for every exact crystal cost, then the Pareto front over cost.
async function boardOptions(b: Board, T: number, cap: number, stale: () => boolean): Promise<Option[]> {
  const n = b.N.length, cost = Int32Array.from(b.N, (o) => o.cost);
  const sumVec = (sel: Uint8Array) => { const v = new Float64Array(T); for (let j = 0; j < n; j++) if (sel[j]) for (let k = 0; k < T; k++) v[k] += b.N[j].w[k]; return v; };
  const startOnly = new Uint8Array(n);
  startOnly[b.start] = 1;
  const opts: Option[] = [{ cost: 0, S: startOnly, v: sumVec(startOnly) }];
  if (cap <= 0) return opts;
  const plan = getPlan(b), { W, nodeWords } = packBoard(b, T);
  const BackT = plan.maxStates * 2 + 2 < 65535 ? Uint16Array : Int32Array;
  const zero = new Float64Array(W), backs: { back: Uint16Array | Int32Array; Kn: number }[] = [];
  // Two reusable value buffers (ping-pong) instead of one allocation per layer.
  let maxLen = 1, cum = 0;
  for (let t = 0; t < n; t++) { cum += cost[plan.layers[t].v]; maxLen = Math.max(maxLen, plan.layers[t].nNew * (Math.min(cap, cum) + 1) * W); }
  let bufA = new Float64Array(maxLen), bufB = new Float64Array(maxLen);
  let pv = new Float64Array(W), Kp = 0;
  cum = 0;
  let lastYield = Date.now();
  for (let t = 0; t < n; t++) {
    const layer = plan.layers[t], v = layer.v, cv = cost[v];
    cum += cv;
    const Kn = Math.min(cap, cum), stN = Kn + 1, stP = Kp + 1;
    const nv = bufA.subarray(0, layer.nNew * stN * W).fill(-1), back = new BackT(layer.nNew * stN);
    const { trans, nPrev } = layer, add = nodeWords.subarray(v * W, v * W + W);
    for (let sp = 0; sp < nPrev; sp++) {
      for (let c = 0; c < 2; c++) {
        const sn = trans[sp * 2 + c];
        if (sn < 0) continue;
        const dc = c ? cv : 0, kmax = Math.min(Kp, Kn - dc), a = c ? add : zero, code = sp * 2 + c;
        for (let k = 0; k <= kmax; k++) {
          const po = (sp * stP + k) * W;
          if (pv[po] < 0) continue;
          const idx = sn * stN + k + dc, no = idx * W;
          let better = nv[no] < 0;
          if (!better) {
            for (let i = 0; i < W; i++) { const d = pv[po + i] + a[i] - nv[no + i]; if (d > EPS) { better = true; break; } if (d < -EPS) break; }
          }
          if (better) { for (let i = 0; i < W; i++) nv[no + i] = pv[po + i] + a[i]; back[idx] = code; }
        }
      }
    }
    backs.push({ back, Kn });
    pv = nv;
    Kp = Kn;
    [bufA, bufB] = [bufB, bufA];
    if (Date.now() - lastYield > YIELD_AFTER) { await tick(); if (stale()) throw new Stale(); lastYield = Date.now(); }
  }
  // pv now holds the single final state: pv[k] = best route with cost exactly k.
  const trace = (k0: number) => {
    const sel = new Uint8Array(n);
    let s = 0, k = k0;
    for (let t = n - 1; t >= 0; t--) {
      const { back, Kn } = backs[t], code = back[s * (Kn + 1) + k], v = plan.layers[t].v;
      if (code & 1) { sel[v] = 1; k -= cost[v]; }
      s = code >> 1;
    }
    return sel;
  };
  // Keep only routes that strictly beat every cheaper route.
  let best = pv.slice(0, W);                         // cost-0 route (start tile only)
  for (let k = 1; k <= Kp; k++) {
    const o = k * W;
    if (pv[o] < 0) continue;
    let better = false;
    for (let i = 0; i < W; i++) { const d = pv[o + i] - best[i]; if (d > EPS) { better = true; break; } if (d < -EPS) break; }
    if (!better) continue;
    best = pv.slice(o, o + W);
    const S = trace(k);
    opts.push({ cost: k, S, v: sumVec(S) });
  }
  return opts;
}

// Per-pool multiple-choice knapsack over the boards' cost -> route tables.
function combinePool(optionLists: Option[][], budget: number, T: number) {
  const maxSpend = optionLists.reduce((s, o) => s + o[o.length - 1].cost, 0), cap = Math.max(0, Math.min(budget, maxSpend));
  let A: (Float64Array | null)[] = new Array(cap + 1).fill(null);
  A[0] = new Float64Array(T);
  const choices: Int32Array[] = [];
  for (const opts of optionLists) {
    const B: (Float64Array | null)[] = new Array(cap + 1).fill(null), ch = new Int32Array(cap + 1).fill(-1);
    for (let c = 0; c <= cap; c++) {
      const base = A[c];
      if (!base) continue;
      for (let oi = 0; oi < opts.length; oi++) {
        const o = opts[oi], c2 = c + o.cost;
        if (c2 > cap) break;
        const cur = B[c2];
        if (!cur) { const cand = new Float64Array(T); for (let k = 0; k < T; k++) cand[k] = base[k] + o.v[k]; B[c2] = cand; ch[c2] = oi; continue; }
        // Replace B[c2] only if base + o.v is strictly better (lexicographic, tolerance EPS).
        let cmp = 0;
        for (let k = 0; k < T; k++) { const d = base[k] + o.v[k] - cur[k]; if (d > EPS) { cmp = 1; break; } if (d < -EPS) { cmp = -1; break; } }
        if (cmp > 0) { for (let k = 0; k < T; k++) cur[k] = base[k] + o.v[k]; ch[c2] = oi; }
      }
    }
    A = B;
    choices.push(ch);
  }
  let bc = -1;
  for (let c = 0; c <= cap; c++) if (A[c] && (bc < 0 || vecCmp(A[c]!, A[bc]!) > 0)) bc = c;
  const pick = new Array<number>(optionLists.length);
  let c = bc;
  for (let j = optionLists.length - 1; j >= 0; j--) { const oi = choices[j][c]; pick[j] = oi; c -= optionLists[j][oi].cost; }
  return pick;
}

// Thrown when a newer request replaced this one while it was running.
export class Stale extends Error {}

// Best route for every board (one Uint8Array of taken tiles each). `pools` is the crystal budget per pool.
export async function solve(B: Board[], pools: Record<Pool, number>, T: number, stale: () => boolean) {
  const S = new Array<Uint8Array>(B.length);
  for (const pool of POOLS) {
    const idx: number[] = [];
    B.forEach((b, i) => { if (b.p === pool) idx.push(i); });
    if (!idx.length) continue;
    const budget = Math.max(0, Math.floor(Number(pools[pool]) || 0)), lists: Option[][] = [];
    for (const i of idx) {
      if (stale()) throw new Stale();
      const b = B[i], total = b.N.reduce((s, o) => s + o.cost, 0);
      lists.push(await boardOptions(b, T, Math.min(budget, total), stale));
    }
    const pick = combinePool(lists, budget, T);
    idx.forEach((bi, q) => { S[bi] = lists[q][pick[q]].S; });
  }
  return S;
}

// Result checks: start tile, connectivity and budgets. A failure discards the result.
export function verify(B: Board[], S: Uint8Array[], pools: Record<Pool, number>) {
  if (S.length !== B.length) throw new Error('The solver returned an invalid board selection.');
  const used: Record<Pool, number> = { c: 0, q: 0, a: 0 };
  B.forEach((b, i) => {
    const s = S[i];
    if (!s || s.length !== b.N.length || b.start < 0 || !s[b.start]) throw new Error(`The route on ${b.n} is missing its start tile.`);
    b.N.forEach((o, j) => { if (s[j]) used[b.p] += o.cost; });
    const seen = new Uint8Array(s.length), q = [b.start];
    seen[b.start] = 1;
    while (q.length) { const x = q.pop()!; for (const y of b.N[x].adj) if (s[y] && !seen[y]) { seen[y] = 1; q.push(y); } }
    for (let j = 0; j < s.length; j++) if (s[j] && !seen[j]) throw new Error(`The route on ${b.n} contains a disconnected tile.`);
  });
  if (POOLS.some((p) => used[p] > pools[p] + 1e-9)) throw new Error('The solver returned a route that exceeds a crystal budget.');
  return used;
}
