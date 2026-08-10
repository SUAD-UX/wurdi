import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface LiquidCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Mirrors the blob silhouette horizontally, for visual variety when stacking multiple LiquidCards */
  flip?: boolean;
}

/**
 * WURDI's organic "liquid glass" surface — reserved for hero/feature moments only
 * (Portfolio Hero, Savings Vault illustration). NOT used for data-dense cards; see GlassCard.
 *
 * ARCHITECTURE NOTE (why this looks the way it does):
 * The organic blob shape and the actual content are two SEPARATE layers:
 *   1. `.liquid-card__silhouette` — an absolutely-positioned div with the organic
 *      border-radius. Purely decorative. It sits slightly INSET from the card edges
 *      so its tightest curves never reach the corners where buttons/text live.
 *   2. The content itself renders in a normal rectangular flow container with
 *      standard padding — no border-radius tricks. It can never be clipped by the
 *      decorative shape because they're different elements.
 * This is what makes "content stays inside a predictable rectangular layout while
 * the liquid silhouette is purely visual" true — not just a padding hack.
 */
export const LiquidCard = forwardRef<HTMLDivElement, LiquidCardProps>(
  ({ className, flip, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative isolate', className)} {...props}>
        {/* Layer 1: decorative organic silhouette + glass material. Inset from the
            outer edge so its curve never reaches into corner content. Also carries
            the idle "wurdi-float" animation (see globals.css) — small, slow. */}
        <div
          className={cn(
            'liquid-card__silhouette absolute inset-2 -z-10',
            'border-glass-border-strong bg-glass-strong border backdrop-blur-[var(--glass-blur)]',
            'shadow-[var(--shadow-ambient)]',
            'transition-[box-shadow] duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          )}
          style={{
            borderRadius: flip
              ? '48% 52% 46% 54% / 52% 48% 54% 46%' // gentler asymmetry than before — controlled, not extreme
              : '52% 48% 54% 46% / 46% 54% 48% 52%',
            animation: 'wurdi-float var(--float-duration) ease-in-out infinite',
          }}
          aria-hidden="true"
        >
          {/* Layer 2: internal glass highlight — a soft light catch along the top
              edge, this is what makes it read as "real glass" rather than a flat
              dark rectangle with a border. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(255,255,255,var(--glass-highlight-opacity)) 0%, transparent 32%)',
              borderRadius: 'inherit',
            }}
          />
          {/* Layer 3: internal ambient glow — soft emerald light emanating from
              within the glass, not a colored outline sitting behind it. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 20% 15%, rgba(18,185,129,var(--glow-primary-opacity)), transparent 70%)',
              borderRadius: 'inherit',
            }}
          />
        </div>

        {/* Layer 4: content — plain rectangular box, standard padding, never
            reshaped by the silhouette above it. This is what stays grid-safe and
            guarantees the "View Portfolio" button is always fully visible/clickable. */}
        <div className="relative z-10 h-full w-full p-7 sm:p-8">{children}</div>
      </div>
    );
  },
);
LiquidCard.displayName = 'LiquidCard';
