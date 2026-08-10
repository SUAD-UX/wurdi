import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LiquidCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Mirrors the blob silhouette horizontally, for variety when stacking multiple liquid cards */
  flip?: boolean;
}

/**
 * The organic "liquid glass" silhouette — asymmetrical flowing corners like melted
 * glass, not a rounded rectangle. Reserved for hero/feature moments (portfolio value,
 * vault illustration) per WURDI's design system. For data-dense grids (metrics, lists,
 * trade rows) use GlassCard instead — true blob edges break alignment at that density.
 */
export const LiquidCard = forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ className, flip, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border-glass-border-strong bg-glass-strong relative overflow-hidden border backdrop-blur-xl',
          'shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_40px_80px_-30px_rgba(0,0,0,0.65)]',
          'transition-[transform,box-shadow] duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          'hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_48px_90px_-28px_rgba(18,185,129,0.18)]',
          className,
        )}
        style={{
          borderRadius: flip
            ? '58% 42% 38% 62% / 45% 55% 45% 55%'
            : '42% 58% 65% 35% / 45% 40% 60% 55%',
          ...style,
        }}
        {...props}
      />
    );
  },
);
LiquidCard.displayName = 'LiquidCard';
