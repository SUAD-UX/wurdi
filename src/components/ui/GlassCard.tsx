import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use a stronger fill/border for cards that need more visual weight */
  strong?: boolean;
  /** Adds a subtle hover lift + glow, for interactive/clickable cards */
  interactive?: boolean;
}

/**
 * The base glassmorphic surface for WURDI: frosted border, soft ambient shadow,
 * generous uniform corner radius. Used for data-dense cards (metrics, lists, trade
 * rows, wallet/vault panels) where a true organic blob edge (see LiquidCard) would
 * break grid alignment. Still carries the same glass/glow/motion DNA as LiquidCard.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, strong, interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-[var(--radius-card)] border backdrop-blur-xl',
          'transition-[transform,box-shadow,border-color] duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          strong ? 'border-glass-border-strong bg-glass-strong' : 'border-glass-border bg-glass',
          'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.6)]',
          interactive &&
            'hover:border-glass-border-strong cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_28px_64px_-20px_rgba(18,185,129,0.14)]',
          className,
        )}
        {...props}
      />
    );
  },
);
GlassCard.displayName = 'GlassCard';
