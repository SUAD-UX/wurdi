'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PerformanceAreaChart } from '@/components/charts/PerformanceAreaChart';
import type { PerformancePoint, TimeRange } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

const RANGES: TimeRange[] = ['24H', '7D', '30D', '90D', '1Y', 'All'];

export interface PerformanceOverviewCardProps {
  data: PerformancePoint[];
}

export function PerformanceOverviewCard({ data }: PerformanceOverviewCardProps) {
  const [range, setRange] = useState<TimeRange>('7D');
  const latest = data[data.length - 1];

  return (
    <GlassCard className="p-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-foreground text-base font-medium">Performance Overview</h3>
        <div className="border-glass-border-strong bg-glass flex items-center gap-1 rounded-full border p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                range === r
                  ? 'bg-primary text-black'
                  : 'text-foreground-subtle hover:text-foreground',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="text-foreground mb-2 inline-block rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs font-medium">
        {formatCurrency(latest.valueUsd)}
      </div>

      <PerformanceAreaChart data={data} detailed height={260} />
    </GlassCard>
  );
}
