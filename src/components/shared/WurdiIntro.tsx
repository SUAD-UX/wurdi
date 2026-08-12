'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { WurdiMark } from '@/components/shared/WurdiMark';

export interface WurdiIntroProps {
  onComplete: () => void;
}

const WORD = 'WURDI'.split('');

const letterVariants: Variants = {
  hidden: { opacity: 0, y: -14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.55 + i * 0.055, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * ~2.4s cinematic intro, shown once per browser session (see IntroGate).
 * Sequence: dark atmosphere -> thin emerald line sweep -> mark forms -> wordmark
 * letters settle in one after another -> tagline -> fades to reveal the
 * dashboard already rendered underneath (no separate "loading then swap" step,
 * so the dashboard feels like it emerges from the same environment).
 */
export function WurdiIntro({ onComplete }: WurdiIntroProps) {
  const shouldReduceMotion = useReducedMotion();

  // Side effect (calling the parent's onComplete) belongs in an effect, not
  // during render — this also correctly dedupes under React Strict Mode's
  // dev-only double-render, since effects (unlike render) only fire once
  // per real mount.
  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onComplete is stable from IntroGate; only shouldReduceMotion should retrigger this
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    // Skip the cinematic entirely — render nothing, dashboard is already
    // underneath (see IntroGate).
    return null;
  }

  return (
    <motion.div
      className="bg-background fixed inset-0 z-[100] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Thin emerald line sweep — scene 2 */}
      <motion.div
        className="absolute top-1/2 h-px w-40 -translate-y-24"
        style={{ background: 'linear-gradient(90deg, transparent, #12b981, transparent)' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 1, 0] }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />

      {/* Mark forms — scene 3 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <WurdiMark size={56} className="text-secondary" />
      </motion.div>

      {/* Wordmark, staggered letters — scene 4 */}
      <div className="mt-5 flex text-3xl font-semibold tracking-[0.15em] text-white sm:text-4xl">
        {WORD.map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            initial="hidden"
            animate="visible"
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Tagline — scene 5 */}
      <motion.p
        className="text-foreground-subtle mt-3 text-sm"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          // Hold briefly on the tagline, then hand off to IntroGate to fade this overlay out.
          setTimeout(onComplete, 500);
        }}
      >
        Your wealth. Your discipline. Your future.
      </motion.p>
    </motion.div>
  );
}
