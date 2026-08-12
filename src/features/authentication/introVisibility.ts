const SESSION_KEY = 'wurdi_intro_shown';

/**
 * Decides whether the cinematic intro should play. Today this is purely
 * session-based (once per browser tab session). Once auth exists, this is the
 * only function that needs to change — e.g.:
 *   - first-time visitor (no account yet)      -> always show
 *   - returning authenticated user              -> skip, or show a shorter variant
 *   - logged-out user on a device that has      -> skip (they've seen it)
 *     seen the intro before
 * No component should read sessionStorage directly — they should all go
 * through this function, so that swap-in is a one-file change.
 */
export function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== 'true';
  } catch {
    // sessionStorage can throw in some privacy modes — fail safe by not blocking the app on an intro.
    return false;
  }
}

export function markIntroShown(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    // ignore — worst case the intro replays once more this session
  }
}
