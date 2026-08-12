'use client';

import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WurdiIntro } from '@/components/shared/WurdiIntro';
import { shouldShowIntro, markIntroShown } from '@/features/authentication/introVisibility';

// useLayoutEffect warns when it runs during SSR (it's a no-op there); this
// swaps to a plain useEffect on the server so that warning never fires, while
// still getting the pre-paint correction on the client.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface IntroGateProps {
  children: ReactNode;
}

/**
 * Renders the dashboard (children) immediately underneath, and — only on a
 * genuine first load this session — overlays the cinematic WurdiIntro on top.
 * Defaults to `showIntro = true` on the very first render so the server and
 * client's first paint match (no hydration mismatch); the sessionStorage check
 * then runs client-side in a layout effect, which fires before the browser
 * paints — so a returning-within-session visitor never sees even a one-frame
 * flash of the intro overlay.
 */
export function IntroGate({ children }: IntroGateProps) {
  const [showIntro, setShowIntro] = useState(true);

  useIsomorphicLayoutEffect(() => {
    if (!shouldShowIntro()) {
      setShowIntro(false);
    }
  }, []);

  function handleComplete() {
    markIntroShown();
    setShowIntro(false);
  }

  return (
    <>
      {children}
      <AnimatePresence>{showIntro && <WurdiIntro onComplete={handleComplete} />}</AnimatePresence>
    </>
  );
}
