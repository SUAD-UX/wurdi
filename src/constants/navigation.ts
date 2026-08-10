import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  PiggyBank,
  Target,
  Bell,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/portfolio', icon: Wallet },
  { label: 'Trades', href: '/trades', icon: ArrowLeftRight },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Savings Vault', href: '/savings', icon: PiggyBank },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Alerts', href: '/alerts', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];
