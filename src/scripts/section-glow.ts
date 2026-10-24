// Section glow and sidebar sub-link highlight shared by the category pages (Gear, Genus Insight, ...).
// Call it inside the page's astro:page-load handler. A section glows when you arrive, when a link to it settles, and when scrolling reaches it.
// `barHeight` is the height of a sticky bar above the content (pushes the trigger line down); `onActive` follows the highlighted section.
export function sectionGlow(sectionIds: string[], opts: { barHeight?: () => number; onActive?: (id: string | null) => void } = {}) {
  const ac = new AbortController();
  const { signal } = ac;
  document.addEventListener('astro:before-swap', () => ac.abort(), { once: true });
  const sections = sectionIds.map((id) => document.getElementById(id)!).filter(Boolean);
  const ids = sections.map((el) => el.id);
  const side = [...document.querySelectorAll<HTMLAnchorElement>('#side .child')];
  // A clicked link stays highlighted (the last sections cannot scroll up to the trigger line) until the reader scrolls on their own.
  let pinned: string | null = ids.includes(location.hash.slice(1)) ? location.hash.slice(1) : null;
  let lastNatural: string | null = null;
  // While a clicked link scrolls the page, sections between where you were and the target glow as they pass, like when scrolling by hand.
  let travel: [number, number] | null = null;
  // When a clicked link scrolls the page, the glow still running fades out quickly so the next one takes over; when the reader scrolls by hand, glows just finish on their own.
  const fadeOut = (el: Element) => {
    if (!el.classList.contains('flash')) return;
    el.classList.remove('flash');
    el.classList.add('flash-out');
    setTimeout(() => el.classList.remove('flash-out'), 750);
  };
  const flash = (el: HTMLElement, handover = false) => {
    if (handover) document.querySelectorAll('.flash').forEach((o) => { if (o !== el) fadeOut(o); });
    el.classList.remove('flash', 'flash-out');
    void el.offsetWidth;
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 2500);
  };
  const mark = () => {
    // The trigger line sits at 30% of the screen at the top of the page and slides down to the bottom edge as you reach the end of the page,
    // so the last short sections can become active even on tall screens where they never scroll up to 30%.
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 1;
    const base = (opts.barHeight?.() ?? 0) + innerHeight * 0.3;
    const line = base + (innerHeight - base) * p;
    let current: HTMLElement | undefined;
    for (const el of sections) if (el.getBoundingClientRect().top <= line) current = el;
    const natural = current?.id ?? null;
    if (natural && lastNatural !== null && natural !== lastNatural) {
      const i = ids.indexOf(natural);
      if (!pinned || (travel && i >= Math.min(...travel) && i <= Math.max(...travel))) flash(document.getElementById(natural)!, !!pinned);
    }
    lastNatural = natural;
    const id = pinned ?? natural;
    opts.onActive?.(id);
    side.forEach((a) => a.classList.toggle('on', a.pathname === location.pathname && a.dataset.hash === id));
  };
  const unpin = () => { if (pinned) { pinned = null; travel = null; mark(); } };
  // After a link jump, start the glow once the scroll has stopped (no scroll event for 150ms), at the latest after 3s; if no scroll starts within 400ms the target is already in place.
  const glow = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    let timer = 0, moving = false;
    const finish = () => { removeEventListener('scroll', bump); clearTimeout(timer); clearTimeout(cap); if (!el.classList.contains('flash')) flash(el, true); };
    const bump = () => { moving = true; clearTimeout(timer); timer = window.setTimeout(finish, 150); };
    const cap = window.setTimeout(finish, 3000);
    addEventListener('scroll', bump, { passive: true, signal });
    timer = window.setTimeout(() => { if (!moving) finish(); }, 400);
  };
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    const hash = a ? new URL(a.href).hash.slice(1) : '';
    if (a && ids.includes(hash) && new URL(a.href).pathname === location.pathname) { travel = [ids.indexOf(lastNatural ?? ids[0]), ids.indexOf(hash)]; pinned = hash; mark(); glow(hash); }
  }, { signal });
  if (pinned) glow(pinned);
  addEventListener('wheel', unpin, { passive: true, signal });
  addEventListener('touchmove', unpin, { passive: true, signal });
  addEventListener('keydown', (e) => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) unpin(); }, { signal });
  addEventListener('pointerdown', (e) => { if (!(e.target as Element).closest('a')) unpin(); }, { signal });
  addEventListener('scroll', mark, { passive: true, signal });
  mark();
  // Arriving on the page (no other section targeted) lights up the first section, like a link to it would.
  if (!pinned || pinned === ids[0]) flash(sections[0]);
  return { signal, mark, unpin };
}
