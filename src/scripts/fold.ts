// Filter panels on stacked layouts (Market, Crafting): the panel folds to its header, which shows the chosen filters in one line.
// The header button is hidden on desktop by CSS, so there the panel is always open. Call inside astro:page-load.
export function foldPanel(panel: HTMLElement, signal: AbortSignal) {
  const btn = panel.querySelector<HTMLButtonElement>('.fold')!;
  const sum = btn.querySelector<HTMLElement>('.fold-sum')!;
  const set = (open: boolean) => { panel.classList.toggle('folded', !open); btn.setAttribute('aria-expanded', String(open)); };
  // Each group's checked button (without its small note) and each select that is not on its first option.
  const summarize = () => {
    const parts = [...panel.querySelectorAll<HTMLElement>('[role="radiogroup"]:not([hidden]) [aria-checked="true"], select')].map((el) => {
      if (el instanceof HTMLSelectElement) return el.selectedIndex > 0 ? el.selectedOptions[0].text : '';
      return [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
    });
    const text = parts.filter(Boolean).join(' · ');
    if (sum.textContent !== text) sum.textContent = text; // writing it is itself a mutation: only write a change, or the observer loops
  };
  set(false);
  btn.addEventListener('click', () => set(panel.classList.contains('folded')), { signal });
  const mo = new MutationObserver(summarize);
  mo.observe(panel, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-checked', 'hidden'] });
  panel.addEventListener('change', summarize, { signal });
  signal.addEventListener('abort', () => mo.disconnect());
  summarize();
}
