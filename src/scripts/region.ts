// Market region (code in market.json) that fits the visitor's time zone. Nothing is sent anywhere: the browser's time zone name is enough.
const NA_EAST = /^America\/(New_York|Toronto|Detroit|Chicago|Indiana|Kentucky|Winnipeg|Halifax|Montreal|Nassau|Havana|Jamaica|Panama)/;
const NA_WEST = /^America\/(Los_Angeles|Vancouver|Denver|Phoenix|Boise|Edmonton|Anchorage|Tijuana)|^Pacific\/Honolulu/;

export const guessRegion = (codes: string[]): string => {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
  const pick = tz.startsWith('Europe/') || tz.startsWith('Atlantic/') || tz.startsWith('Africa/') ? 'EU'
    : NA_EAST.test(tz) ? 'NAE'
    : NA_WEST.test(tz) ? 'NAW'
    : tz.startsWith('America/') ? 'LA'
    : /^(Asia|Australia)\//.test(tz) || tz.startsWith('Pacific/') ? 'AS'
    : 'EU';
  return codes.includes(pick) ? pick : codes.includes('EU') ? 'EU' : codes[0];
};
