import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LiquidCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Mirrors the corner emphasis, for visual variety when stacking multiple LiquidCards */
  flip?: boolean;
}

/**
 * WURDI's organic "liquid glass" surface — reserved for hero/feature moments only.
 *
 * WHY REM VALUES, NOT PERCENTAGES:
 * The first version used percentage-based border-radius (e.g. "52% 48% 54% 46%").
 * On a wide/short card (a portfolio hero is ~4:1 width:height) that ALWAYS collapses
 * into a plain ellipse — percentage radii scale with the box's own width/height, so
 * on a wide box the horizontal radius becomes huge relative to the height and the
 * straight edges disappear entirely. Fixed rem values don't scale with the box, so
 * the card keeps mostly-straight edges with soft, uneven curvature concentrated at
 * the corners — a rounded rectangle with organic "melted glass" corners, not a stadium.
 *
 * LAYERING (unchanged from before, this part was correct):
 *   1. `.liquid-card__silhouette` — decorative shape + glass material, inset from
 *      the outer edge so its curve never reaches into corner content.
 *   2. Content renders in a normal rectangular flow container, independent of the
 *      shape above it — it can't be clipped because they're different elements.
 */
export const LiquidCard = forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ className, flip, children, ...props }, ref) => {
    const silhouetteRadius = flip
      ? '2rem 3.5rem 2.75rem 4.5rem'
      : '3.5rem 2rem 4.5rem 2.75rem';

    return (
      <div ref={ref} className={cn('relative isolate', className)} {...props}>
        {/* Layer 1: decorative organic silhouette + glass material. */}
        <div
          className={cn(
            'liquid-card__silhouette absolute inset-2 -z-10',
            'border-glass-border-strong bg-glass-strong border backdrop-blur-[var(--glass-blur)]',
            'shadow-[var(--shadow-ambient)]',
            'transition-[box-shadow] duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          )}
          style={{
            // Fixed rem radii, deliberately uneven per corner — this is what keeps
            // the "rounded rectangle with organic corners" read instead of an oval.
            borderRadius: silhouetteRadius,
            animation: 'wurdi-float var(--float-duration) ease-in-out infinite',
          }}
          aria-hidden="true"
        >
          {/* Layer 2: internal glass highlight — soft light catch, upper-left,
              small and contained so it reads as a reflection, not a wash. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(155deg, rgba(255,255,255,var(--glass-highlight-opacity)) 0%, transparent 22%)',
              borderRadius: 'inherit',
              clipPath: `inset(0 round ${silhouetteRadius})`,
            }}
          />
          {/* Layer 3: internal ambient glow — small radial catch in one corner,
              not a gradient large enough to read as a solid fill. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(32% 40% at 14% 10%, rgba(18,185,129,var(--glow-primary-opacity)), transparent 75%)',
              borderRadius: 'inherit',
              clipPath: `inset(0 round ${silhouetteRadius})`,
            }}
          />
        </div>

        {/* Layer 4: content — plain rectangular box, standard padding, never
            reshaped by the silhouette above it. */}
        <div className="relative z-10 h-full w-full p-7 sm:p-8">{children}</div>
      </div>
    );
  },
);
LiquidCard.displayName = 'LiquidCard';
