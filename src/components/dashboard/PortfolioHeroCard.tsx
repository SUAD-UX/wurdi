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
 * Sculpted rounded-rectangle glass panel — no organic/oval/blob treatment.
 * Built on GlassCard (translucent fill, backdrop blur, thin border, top-left
 * reflection, soft ambient shadow) with a wider corner radius (32px, within the
 * 28-36px range) for a premium terminal feel.
 *
 * Two things were actually causing the "oval" look on the rendered page, both
 * fixed here:
 *   1. The chart (PerformanceAreaChart) had no explicit Y-axis domain, so its
 *      area fill ran from the line down to y=0 — since portfolio values are
 *      ~$11-13K, that filled almost the whole chart height with solid green.
 *      Fixed in the chart component itself (domain padded to the data's own
 *      min/max) so it now reads as a thin line with a faint fade, not a block.
 *   2. The permanent internal glow used a small, tightly-bounded radial-gradient,
 *      which combined with the chart fill read as a distinct green ellipse
 *      sitting on the panel. Widened and softened so it reads as diffuse
 *      atmosphere instead of a shape.
 *
 * LiquidCard remains available and untouched for other feature moments — this
 * card just doesn't use it.
 */
export function PortfolioHeroCard({ snapshot, performance }: PortfolioHeroCardProps) {
  const isPositive = snapshot.changeUsd24h >= 0;

  return (
    <GlassCard strong className="rounded-[2rem] p-8 sm:p-9">
      {/* Permanent, very faint internal glow — distinct from GlassCard's hover-only
          interactive glow. Deliberately large-radius and low-opacity so it reads as
          diffuse atmosphere soaked into the glass, not a bounded ellipse/shape sitting
          on top of the panel — a tighter, higher-opacity version of this is what was
          likely reading as an "oval" before. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(85% 140% at 8% 0%, rgba(18,185,129,0.055), transparent 78%)',
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
