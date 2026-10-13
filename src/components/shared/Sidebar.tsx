'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/constants/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { WurdiMark } from '@/components/shared/WurdiMark';
import { truncateAddress } from '@/utils/format';

export interface SidebarProps {
  userName: string;
  walletAddress: string;
  /** 'full' = labels + footer text (desktop, and inside the mobile drawer).
   *  'rail' = icon-only collapsed strip (tablet). */
  variant?: 'full' | 'rail';
  /** Called when a nav link is clicked — used by the mobile drawer to close itself. */
  onNavigate?: () => void;
}

/** Left navigation: brand, primary nav, account switcher. Renders as a full sidebar
 *  (desktop / mobile drawer) or a collapsed icon-only rail (tablet) via `variant`. */
export function Sidebar({ userName, walletAddress, variant = 'full', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const isRail = variant === 'rail';

  return (
    <aside
      className={cn(
        'border-glass-border flex h-full shrink-0 flex-col justify-between border-r py-8',
        isRail ? 'w-20 items-center px-3' : 'w-64 px-6',
      )}
    >
      <div className={cn('w-full', isRail && 'flex flex-col items-center')}>
        <div className={cn('mb-10', isRail ? 'flex justify-center' : '')}>
          <div className={cn('flex items-center gap-2', isRail ? 'mb-0' : 'mb-3')}>
            <div className="text-secondary flex h-9 w-9 shrink-0 items-center justify-center">
              <WurdiMark size={36} className="h-9 w-9" />
            </div>
            {!isRail && (
              <span className="text-foreground text-lg font-semibold tracking-wide">WURDI</span>
            )}
          </div>
          {!isRail && <p className="text-foreground-subtle mt-3 text-xs">Wealth. Disciplined.</p>}
        </div>

        <nav
          className={cn('flex w-full flex-col gap-1', isRail && 'items-center')}
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                title={isRail ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl text-sm font-medium transition-colors duration-200',
                  isRail ? 'h-11 w-11 justify-center' : 'w-full px-3 py-2.5',
                  isActive
                    ? 'bg-primary/12 text-secondary'
                    : 'text-foreground-muted hover:text-foreground hover:bg-white/[0.04]',
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                {!isRail && item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {(userName.trim() || walletAddress.trim()) && (
        <div className={cn('flex flex-col gap-4', isRail ? 'items-center' : '')}>
        {isRail ? (
          <Avatar name={userName || walletAddress} title={userName || walletAddress} />
        ) : (
          <button className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:bg-white/[0.04]">
            <Avatar name={userName || walletAddress} />
            <span className="min-w-0 flex-1">
              {userName.trim() && (
                <span className="text-foreground block truncate text-sm font-medium">{userName}</span>
              )}
              {walletAddress.trim() && (
                <span className="text-foreground-subtle block truncate text-xs">
                  {truncateAddress(walletAddress)}
                </span>
              )}
            </span>
            <ChevronDown className="text-foreground-subtle h-4 w-4" />
          </button>
        )}
        </div>
      )}
    </aside>
  );
}
