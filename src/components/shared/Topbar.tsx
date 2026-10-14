import { Bell, Menu } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { NetworkSelector } from '@/components/shared/NetworkSelector';
import { SearchTrigger } from '@/components/shared/SearchTrigger';
import { cn } from '@/lib/utils';

export interface TopbarProps {
  userName: string;
  hasNotifications?: boolean;
  /** Present only on mobile — opens the off-canvas nav drawer. */
  onMenuClick?: () => void;
  onSearchClick: () => void;
}

/** Page header: personalized greeting on the left, global controls on the right. */
export function Topbar({
  userName,
  hasNotifications,
  onMenuClick,
  onSearchClick,
}: TopbarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const trimmedName = userName.trim();
  const safeName =
    /^0x[a-fA-F0-9]{40}$/.test(trimmedName) ||
    /^wallet\s+0x[0-9a-f]+\.{3}[0-9a-f]+$/i.test(trimmedName)
      ? ''
      : trimmedName;

  return (
    <header className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <IconButton aria-label="Open menu" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
          </IconButton>
        )}
        <div className="min-w-0">
          <h1 className="text-foreground truncate text-xl font-semibold sm:text-2xl">
            {greeting}{safeName ? `, ${safeName}` : ''}
          </h1>
          <p className="text-foreground-subtle mt-1 text-sm">
            Your wins, locked in.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:flex-nowrap md:justify-end">
        <SearchTrigger onClick={onSearchClick} />

        <IconButton aria-label="Notifications" className="relative">
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          {hasNotifications && (
            <span className="bg-primary absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full" />
          )}
        </IconButton>

        <NetworkSelector />

        <span className="border-glass-border bg-glass text-foreground-muted inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs">
          <span className={cn('relative flex h-2 w-2')}>
            <span className="bg-secondary absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" />
            <span className="bg-secondary relative inline-flex h-2 w-2 rounded-full" />
          </span>
          Monad Testnet · Live
        </span>
      </div>
    </header>
  );
}
