import house from 'lucide-static/icons/house.svg?raw';
import chart from 'lucide-static/icons/chart-column.svg?raw';
import anvil from 'lucide-static/icons/anvil.svg?raw';
import paw from 'lucide-static/icons/paw-print.svg?raw';
import waypoints from 'lucide-static/icons/waypoints.svg?raw';

// Two fanned arcana cards (Lucide has none): the left one sits behind the right one and is masked where they overlap.
const card = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><mask id="arc-fan" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"/><rect x="7" y="4" width="10" height="17" rx="1.5" transform="rotate(-11 12 22)" fill="#000" stroke="#000" stroke-width="2"/></mask><rect x="7" y="4" width="10" height="17" rx="1.5" transform="rotate(11 12 22)" mask="url(#arc-fan)"/><g transform="rotate(-11 12 22)"><rect x="7" y="4" width="10" height="17" rx="1.5"/><path d="M12 9.800c.3 1.700 1 2.400 2.700 2.700-1.700.3-2.400 1-2.700 2.700-.3-1.700-1-2.400-2.700-2.700 1.700-.3 2.400-1 2.700-2.700z"/></g></svg>';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  ready: boolean;
  text: string;
  /** Sections of the page, shown under it in the sidebar only (not on the home page). */
  children?: { label: string; hash: string }[];
}

// Labels are the in-game menu names (Arcana, Stats); Gear and Daevanion Optimizer are the owner's own names.
// One flat list, no groups: Stats, Gear, Genus Insight, Arcana, Daevanion Optimizer.
export const nav: NavItem[] = [
  { label: 'Stats', href: 'stats/', icon: chart, ready: true, text: 'The stats that matter most, ranked, and where to get each one.' },
  { label: 'Gear', href: 'gear/', icon: anvil, ready: true, text: 'Best stat lines and enhancement order.',
    children: [['Best stat lines', 'best-lines'], ['Enhance', 'step-enhance'], ['Amplify', 'step-amplify'], ['Soul Binding', 'step-soul-binding'], ['Manastones', 'step-manastones'], ['Theostone', 'step-theostone'], ['Potential', 'step-potential']].map(([label, hash]) => ({ label, hash })) },
  { label: 'Genus Insight', href: 'genus/', icon: paw, ready: true, text: 'Best line per slot and the order to roll them.',
    children: [['Best lines', 'best-lines'], ['Rolling order', 'rolling-order']].map(([label, hash]) => ({ label, hash })) },
  { label: 'Arcana', href: 'arcana/', icon: card, ready: true, text: 'Best card per slot and best set.',
    children: [['Best cards', 'best-cards'], ['Sets', 'sets'], ['Upgrading', 'upgrading']].map(([label, hash]) => ({ label, hash })) },
  { label: 'Daevanion Optimizer', href: 'daevanion/', icon: waypoints, ready: true, text: 'The best node route for your class and crystals.' },
];

export const homeIcon = house;
