import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkline } from '@/components/charts/Sparkline';
import { formatPercent, formatSignedCurrency } from '@/utils/format';

export interface PnLMetricCardProps {
  label: string;
  valueUsd: number;
  percent: number;
  trend: number[];
}

/** One PnL tile: label, dollar delta, percent change, and a trend sparkline. */
export function PnLMetricCard({ label, valueUsd, percent, trend }: PnLMetricCardProps) {
  const isPositive = valueUsd >= 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const sparklineData = trend.map((value) => ({ value }));

  return (
    <GlassCard className="min-w-0 p-5">
      <p className="text-foreground-subtle mb-2 truncate text-sm">{label}</p>
      <p
        className={`flex min-w-0 flex-wrap items-center gap-1 text-base font-semibold break-words sm:text-lg ${
          isPositive ? 'text-secondary' : 'text-loss'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
        {formatSignedCurrency(valueUsd)}
      </p>
      <p className="text-foreground-subtle mt-0.5 text-xs">{formatPercent(percent)}</p>
      <div className="mt-2">
        <Sparkline data={sparklineData} positive={isPositive} />
      </div>
    </GlassCard>
  );
}
