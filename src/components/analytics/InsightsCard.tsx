import { ChevronRight, Coins, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import type { InsightItem } from '@/types/portfolio';

export interface InsightsCardProps {
  insights: InsightItem[];
}

const ICONS = {
  'trend-up': TrendingUp,
  coins: Coins,
};

export function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-medium">Insights</h3>
        <Link href="/analytics" className="text-foreground-subtle hover:text-secondary text-xs font-medium">
          View All
        </Link>
      </div>

      {insights.length === 0 ? (
        <p className="text-foreground-subtle py-4 text-sm">
          Insights appear after your first trades.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {insights.map((insight) => {
            const Icon = ICONS[insight.icon];
            return (
              <button
                key={insight.id}
                className="border-glass-border hover:border-secondary/25 flex items-center gap-3 rounded-2xl border bg-white/[0.015] p-3 text-left transition-[transform,border-color] duration-[var(--duration-liquid)] ease-[var(--ease-liquid)] hover:-translate-y-0.5"
              >
                <div className="bg-primary/12 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <Icon className="text-secondary h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium">{insight.title}</p>
                  <p className="text-foreground-subtle truncate text-xs">{insight.description}</p>
                </div>
                <ChevronRight className="text-foreground-subtle h-4 w-4 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
