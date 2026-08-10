import { ArrowUpRight, Eye } from 'lucide-react';
import { LiquidCard } from '@/components/ui/LiquidCard';
import { Button } from '@/components/ui/Button';
import { PerformanceAreaChart } from '@/components/charts/PerformanceAreaChart';
import type { PerformancePoint, PortfolioSnapshot } from '@/types/portfolio';
import { formatCurrency, formatPercent, formatSignedCurrency } from '@/utils/format';

export interface PortfolioHeroCardProps {
  snapshot: PortfolioSnapshot;
  performance: PerformancePoint[];
}

/**
 * The primary "total portfolio value" hero. Uses LiquidCard, which handles the
 * organic glass silhouette as a separate decorative layer — everything below is
 * plain rectangular layout, so it can never be clipped by the shape.
 * Deliberately compact vertically (was too tall/heavy before this revision).
 */
export function PortfolioHeroCard({ snapshot, performance }: PortfolioHeroCardProps) {
  const isPositive = snapshot.changeUsd24h >= 0;

  return (
    <LiquidCard>
      <div className="text-foreground-subtle mb-1 flex items-center gap-2 text-sm">
        <span>Total Portfolio Value</span>
        <Eye className="h-4 w-4" strokeWidth={2} />
      </div>

      <p className="text-foreground text-4xl font-semibold tracking-tight">
        {formatCurrency(snapshot.totalValueUsd)}
      </p>
      <p
        className={`mt-2 flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-secondary' : 'text-loss'
        }`}
      >
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
        {formatSignedCurrency(snapshot.changeUsd24h)} ({formatPercent(snapshot.changePercent24h)})
        Today
      </p>

      <div className="-mx-2 mt-3">
        <PerformanceAreaChart data={performance} height={96} />
      </div>

      <div className="mt-2 flex justify-end">
        <Button variant="secondary" size="sm">
          View Portfolio <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </LiquidCard>
  );
}
