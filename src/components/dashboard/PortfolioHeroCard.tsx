import { ArrowUpRight, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { PerformanceAreaChart } from '@/components/charts/PerformanceAreaChart';
import type { PerformancePoint, PortfolioSnapshot } from '@/types/portfolio';
import { formatCurrency, formatPercent, formatSignedCurrency } from '@/utils/format';

export interface PortfolioHeroCardProps {
  snapshot: PortfolioSnapshot;
  performance: PerformancePoint[];
}

/**
 * The primary "total portfolio value" panel.
 *
 * REDESIGNED per direct feedback on the rendered page: the previous organic/
 * LiquidCard blob treatment read as a plain oval at this card's wide aspect
 * ratio, not as premium liquid glass. This version drops the organic silhouette
 * entirely and uses a sculpted rounded-rectangle glass panel instead — same
 * glass material (GlassCard: translucent fill, backdrop blur, thin border, top-left
 * reflection, soft ambient shadow) but with a wider corner radius (32px, i.e.
 * within the requested 28-36px range) for a premium terminal feel, plus a
 * permanent (not hover-only) faint internal emerald glow specific to this hero
 * moment — GlassCard's own glow layer is hover-only by design, so it's composed
 * here rather than changed globally.
 *
 * LiquidCard itself is untouched and still available for other feature moments
 * (see components/ui/LiquidCard.tsx) — this card just no longer uses it.
 */
export function PortfolioHeroCard({ snapshot, performance }: PortfolioHeroCardProps) {
  const isPositive = snapshot.changeUsd24h >= 0;

  return (
    <GlassCard strong className="rounded-[2rem] p-8 sm:p-9">
      {/* Permanent, very faint internal glow — distinct from GlassCard's hover-only
          interactive glow. Kept subtle: this is atmosphere, not a spotlight. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(42% 55% at 16% 12%, rgba(18,185,129,0.09), transparent 72%)',
          borderRadius: 'inherit',
        }}
        aria-hidden="true"
      />

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

      <div className="-mx-2 mt-4">
        <PerformanceAreaChart data={performance} height={88} />
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="secondary" size="sm">
          View Portfolio <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </GlassCard>
  );
}
