import house from 'lucide-static/icons/house.svg?raw';
import chart from 'lucide-static/icons/chart-column.svg?raw';
import anvil from 'lucide-static/icons/anvil.svg?raw';
import spade from 'lucide-static/icons/spade.svg?raw';
import paw from 'lucide-static/icons/paw-print.svg?raw';
import hexagon from 'lucide-static/icons/hexagon.svg?raw';
import swords from 'lucide-static/icons/swords.svg?raw';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  ready: boolean;
  text: string;
  /** Page nested under the previous item (e.g. Genus under Pets). */
  sub?: boolean;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Labels are the in-game menu names exactly (Pets, Enhancement, Arcana, Daevanion, Skills, Stats).
// Order inside Character follows the client: Stats, then Pets, Enhancement, Arcana.
export const nav: NavGroup[] = [
  {
    title: 'Character',
    items: [
      { label: 'Stats', href: 'stats/', icon: chart, ready: true, text: 'The stats that matter most, ranked, and where to get each one.' },
      { label: 'Pets', href: 'pets/', icon: paw, ready: false, text: 'Best pets and how to use them.' },
      { label: 'Genus', href: 'pets/genus/', icon: paw, ready: false, sub: true, text: 'Best line per slot, when to stop rerolling and how not to burn resources.' },
      { label: 'Enhancement', href: 'enhancement/', icon: anvil, ready: false, text: 'Best gear, best lines, enhancement order and what not to waste Kinah on.' },
      { label: 'Arcana', href: 'arcana/', icon: spade, ready: false, text: 'Best card per slot, best set and what not to waste on it.' },
    ],
  },
  {
    title: 'Menu',
    items: [
      { label: 'Daevanion', href: 'daevanion/', icon: hexagon, ready: false, text: 'Best node route per class.' },
      { label: 'Skills', href: 'skills/', icon: swords, ready: false, text: 'Every pick for your class in one place.' },
    ],
  },
];

export const homeIcon = house;
