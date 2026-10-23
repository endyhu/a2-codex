import house from 'lucide-static/icons/house.svg?raw';
import chart from 'lucide-static/icons/chart-column.svg?raw';
import sword from 'lucide-static/icons/sword.svg?raw';
import layers from 'lucide-static/icons/layers.svg?raw';
import paw from 'lucide-static/icons/paw-print.svg?raw';
import hexagon from 'lucide-static/icons/hexagon.svg?raw';
import swords from 'lucide-static/icons/swords.svg?raw';
import coins from 'lucide-static/icons/coins.svg?raw';

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

// Labels are the in-game menu names exactly (Pets, Enhancement, Arcana, Daevanion, Skills, Market, Stats).
// Order inside Character follows the client: Stats, then Pets, Enhancement, Arcana.
export const nav: NavGroup[] = [
  {
    title: 'Character',
    items: [
      { label: 'Stats', href: 'stats/', icon: chart, ready: true, text: 'What every stat does.' },
      { label: 'Pets', href: 'pets/', icon: paw, ready: false, text: 'Best pets and how to use them.' },
      { label: 'Genus', href: 'pets/genus/', icon: paw, ready: false, sub: true, text: 'Best line per slot and when to stop rerolling.' },
      { label: 'Enhancement', href: 'enhancement/', icon: sword, ready: false, text: 'Best gear, best lines, enhancement order.' },
      { label: 'Arcana', href: 'arcana/', icon: layers, ready: false, text: 'Best card per slot and best set.' },
    ],
  },
  {
    title: 'Menu',
    items: [
      { label: 'Daevanion', href: 'daevanion/', icon: hexagon, ready: false, text: 'Best node route per class.' },
      { label: 'Skills', href: 'skills/', icon: swords, ready: false, text: 'Every pick for your class in one place.' },
    ],
  },
  {
    title: 'Activity',
    items: [
      { label: 'Market', href: 'market/', icon: coins, ready: false, text: 'Save Kinah: what not to waste money on.' },
    ],
  },
];

export const homeIcon = house;
