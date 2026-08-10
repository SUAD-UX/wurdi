'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { truncateAddress } from '@/utils/format';

export interface SidebarProps {
  userName: string;
  walletAddress: string;
}

/** Fixed left sidebar: brand, primary nav, upgrade prompt, and account switcher. */
export function Sidebar({ userName, walletAddress }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-glass-border flex h-screen w-64 shrink-0 flex-col justify-between border-r px-6 py-8">
      <div>
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <div className="bg-primary/15 flex h-9 w-9 items-center justify-center rounded-xl">
              <Sprout className="text-secondary h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <span className="text-foreground text-lg font-semibold tracking-wide">WURDI</span>
          </div>
          <p className="text-foreground-subtle text-xs">Wealth. Disciplined.</p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-primary/12 text-secondary'
                    : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.04]',
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:bg-white/[0.04]">
          <Avatar name={userName} />
          <span className="min-w-0 flex-1">
            <span className="text-foreground block truncate text-sm font-medium">{userName}</span>
            <span className="text-foreground-subtle block truncate text-xs">
              {truncateAddress(walletAddress)}
            </span>
          </span>
          <ChevronDown className="text-foreground-subtle h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
