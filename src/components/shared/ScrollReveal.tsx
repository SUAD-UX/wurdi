'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

export interface ScrollRevealProps {
  children: ReactNode;
  /** Stagger delay in seconds, for revealing a list of cards in sequence. */
  delay?: number;
  className?: string;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }, // gentle emergence, no bounce
  },
};

/**
 * Wraps a card to animate it in on scroll, WITHOUT touching the card's own
 * glass implementation (GlassCard/LiquidCard are untouched — this is purely an
 * outer motion.div around whatever is passed as children). Once the animation
 * completes, this wrapper has no further effect: the card underneath renders
 * exactly as it always has, including its own hover lift/glow.
 *
 * `viewport={{ once: true }}` means each card reveals once, not on every
 * scroll back into view — avoids a distracting replay loop.
 */
export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    // Respect prefers-reduced-motion: render immediately, no animation at all.
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
