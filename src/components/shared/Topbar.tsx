import { Bell, ChevronDown, Globe, Menu } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { SearchTrigger } from '@/components/shared/SearchTrigger';

export interface TopbarProps {
  userName: string;
  network: string;
  hasNotifications?: boolean;
  /** Present only on mobile — opens the off-canvas nav drawer. */
  onMenuClick?: () => void;
  onSearchClick: () => void;
}

/** Page header: personalized greeting on the left, global controls on the right. */
export function Topbar({
  userName,
  network,
  hasNotifications,
  onMenuClick,
  onSearchClick,
}: TopbarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <IconButton aria-label="Open menu" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
          </IconButton>
        )}
        <div className="min-w-0">
          <h1 className="text-foreground flex items-center gap-2 truncate text-xl font-semibold sm:text-2xl">
            {greeting}, {userName} <span aria-hidden>👋</span>
          </h1>
          <p className="text-foreground-subtle mt-1 hidden text-sm sm:block">
            Track. Analyze. Grow. Secure your future.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SearchTrigger onClick={onSearchClick} />

        <IconButton aria-label="Notifications" className="relative">
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          {hasNotifications && (
            <span className="bg-primary absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full" />
          )}
        </IconButton>

        <button className="border-glass-border-strong bg-glass text-foreground-muted hover:text-foreground flex h-10 items-center gap-2 rounded-full border px-3 text-sm transition-colors sm:px-4">
          <Globe className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="hidden sm:inline">{network}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>
    </header>
  );
}
