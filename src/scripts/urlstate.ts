// Filters in the address bar (?r=EU&f=Asmodian&srv=12318 ...) so a view can be bookmarked or sent to someone.
// Read once on load (it wins over the saved settings), written with replaceState so the Back button is not filled with filter steps.
export const readUrl = (): URLSearchParams => new URLSearchParams(location.search);

export const oneOf = (v: string | null, ok: string[]): string | undefined => (v && ok.includes(v) ? v : undefined);

// Values equal to their default (or empty) are left out to keep the link short.
export const writeUrl = (values: Record<string, string | number | undefined>, defaults: Record<string, string | number> = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) if (v !== undefined && v !== '' && v !== 0 && v !== defaults[k]) p.set(k, String(v));
  const qs = p.toString().replace(/%3A/gi, ':').replace(/%2C/gi, ','); // both are legal in a query and keep lists readable
  history.replaceState(history.state, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
};
