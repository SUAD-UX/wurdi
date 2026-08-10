import { Bell, ChevronDown, Globe } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

export interface TopbarProps {
  userName: string;
  network: string;
  hasNotifications?: boolean;
}

/** Page header: personalized greeting on the left, global controls on the right. */
export function Topbar({ userName, network, hasNotifications }: TopbarProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-foreground flex items-center gap-2 text-2xl font-semibold">
          {greeting}, {userName} <span aria-hidden>👋</span>
        </h1>
        <p className="text-foreground-subtle mt-1 text-sm">
          Track. Analyze. Grow. Secure your future.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <IconButton aria-label="Notifications" className="relative">
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          {hasNotifications && (
            <span className="bg-primary absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full" />
          )}
        </IconButton>

        <button className="border-glass-border-strong bg-glass text-foreground-muted hover:text-foreground flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors">
          <Globe className="h-4 w-4" strokeWidth={2} />
          {network}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
