'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Upload,
  ArrowLeftRight,
  RefreshCcw,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

interface QuickAction {
  label: string;
  icon: LucideIcon;
}

const ACTIONS: QuickAction[] = [
  { label: 'Deposit', icon: Download },
  { label: 'Withdraw', icon: Upload },
  { label: 'Transfer', icon: ArrowLeftRight },
  { label: 'Auto Save', icon: RefreshCcw },
  { label: 'Report', icon: FileText },
];

export function QuickActions() {
  const router = useRouter();

  const handleClick = useCallback((label: string) => {
    if (label === 'Report') {
      router.push('/analytics');
      return;
    }

    // All other quick actions require exchange/wallet operations which are
    // outside the MVP scope. Show a clear, explicit message instead of
    // pretending the functionality exists.
    try {
      // eslint-disable-next-line no-alert
      alert(`${label} is not available yet in the WURDI MVP.`);
    } catch (e) {
      // noop in environments without window.alert
    }
  }, [router]);

  return (
    <GlassCard className="p-6">
      <h3 className="text-foreground mb-4 text-sm font-medium">Quick Action</h3>
      <div className="grid grid-cols-5 gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleClick(action.label)}
            className="text-foreground-muted hover:text-foreground flex flex-col items-center gap-2 rounded-2xl py-2 transition-colors"
          >
            <span className="border-glass-border-strong bg-glass flex h-11 w-11 items-center justify-center rounded-full border">
              <action.icon className="text-secondary h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
