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
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Groups and labels mirror the in-game menu (default hotkey menu). Keep them in sync with the client.
export const nav: NavGroup[] = [
  {
    title: 'Character',
    items: [
      { label: 'Stats', href: 'stats/', icon: chart, ready: true, text: 'What every stat does.' },
      { label: 'Gear', href: 'gear/', icon: sword, ready: false, text: 'Best items, best lines, enhancement order.' },
      { label: 'Arcana', href: 'arcana/', icon: layers, ready: false, text: 'Best card per slot and best set.' },
      { label: 'Genus', href: 'genus/', icon: paw, ready: false, text: 'Best line per slot and when to stop rerolling.' },
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
