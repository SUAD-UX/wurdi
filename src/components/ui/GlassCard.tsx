import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use a stronger fill/border for cards that need more visual weight */
  strong?: boolean;
  /** Adds a subtle hover lift + glow, for interactive/clickable cards */
  interactive?: boolean;
}

/**
 * WURDI's standard glass surface: frosted, translucent, uniform rounded corners.
 * Used for every data-dense card (PnL tiles, trade rows, wallet/vault panels,
 * insights) — anywhere a true organic LiquidCard silhouette would break grid
 * alignment. All "how glassy is this" values live in globals.css as tokens
 * (--glass-fill-opacity, --glass-border-opacity, --glass-blur, --glass-highlight-opacity).
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, strong, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative isolate overflow-hidden rounded-[var(--radius-card)] border backdrop-blur-[var(--glass-blur)]',
          'transition-[transform,box-shadow,border-color] duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          strong ? 'border-glass-border-strong bg-glass-strong' : 'border-glass-border bg-glass',
          'shadow-[var(--shadow-ambient)]',
          interactive &&
            'group hover:border-glass-border-strong cursor-pointer hover:-translate-y-0.5',
          className,
        )}
        {...props}
      >
        {/* Internal highlight: soft light catch along the top-left edge, so
            content reads as embedded IN the glass rather than sitting on top
            of a flat dark rectangle. Same technique as LiquidCard, uniform corners. */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(155deg, rgba(255,255,255,var(--glass-highlight-opacity)) 0%, transparent 40%)',
          }}
          aria-hidden="true"
        />
        {interactive && (
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-[var(--duration-liquid)] ease-[var(--ease-liquid)] group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(60% 50% at 30% 0%, rgba(18,185,129,var(--glow-primary-opacity)), transparent 70%)',
            }}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    );
  },
);
GlassCard.displayName = 'GlassCard';
