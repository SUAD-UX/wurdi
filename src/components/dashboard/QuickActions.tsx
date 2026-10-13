'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  soon?: boolean;
  href?: string;
}

const ACTIONS: QuickAction[] = [
  { label: 'Auto Save', icon: RefreshCcw, href: '/profit-lock' },
  { label: 'Deposit', icon: Download, soon: true },
  { label: 'Withdraw', icon: Upload, soon: true },
  { label: 'Transfer', icon: ArrowLeftRight, soon: true },
  { label: 'Report', icon: FileText, soon: true },
];

export function QuickActions() {
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    setShowToast(true);
    toastTimeout.current = setTimeout(() => setShowToast(false), 2500);
  }, []);

  useEffect(() => () => {
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
  }, []);

  return (
    <GlassCard className="p-6">
      <h3 className="text-foreground mb-4 text-sm font-medium">Quick Action</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
        {ACTIONS.map((action) => (
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className="bg-primary/10 text-secondary border-primary/20 hover:bg-primary/15 col-span-2 flex flex-col items-center justify-center gap-2 rounded-2xl border py-3 transition-colors sm:col-span-2"
            >
              <span className="bg-primary/15 flex h-14 w-14 items-center justify-center rounded-full">
                <action.icon className="h-6 w-6" strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ) : (
            <button
              key={action.label}
              onClick={handleClick}
              className="text-foreground-muted hover:text-foreground flex flex-col items-center gap-2 rounded-2xl py-2 transition-colors"
            >
              <span className="border-glass-border-strong bg-glass flex h-11 w-11 items-center justify-center rounded-full border">
                <action.icon className="text-secondary h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <span className="flex flex-wrap items-center justify-center gap-1 text-xs">
                {action.label}
                {action.soon && (
                  <span className="rounded-full border border-glass-border-strong px-1.5 py-0.5 text-[9px] leading-none text-foreground-subtle">
                    Soon
                  </span>
                )}
              </span>
            </button>
        )))}
      </div>
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="border-glass-border-strong bg-background-elevated/95 text-foreground fixed right-4 bottom-4 z-50 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl sm:right-6 sm:bottom-6"
        >
          Coming soon
        </div>
      )}
    </GlassCard>
  );
}
