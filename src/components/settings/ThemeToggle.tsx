'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

/**
 * Reads/writes the `data-theme` attribute on <html> that globals.css already
 * branches on (see the [data-theme='light'] token block). No new theming
 * system — this is just the first UI control for tokens that already existed.
 * Persists the choice in localStorage so it survives a refresh.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  // Reads the persisted choice once on mount. This genuinely can't be a lazy
  // useState initializer: layout.tsx statically renders data-theme="dark" on
  // <html> for SSR, so reading localStorage during the initial render (client
  // or server) risks a hydration mismatch. An effect — synchronizing React
  // state with an external system (localStorage), per React's own docs — is
  // the correct tool here; this is the documented exception to "don't setState
  // in an effect" (react.dev/learn/you-might-not-need-an-effect).
  useEffect(() => {
    const stored = window.localStorage.getItem('wurdi-theme') as Theme | null;
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
  }, []);

  // Keeps the <html data-theme> attribute in sync with React state, instead of
  // mutating the DOM directly inside the click handler below.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function handleToggle(next: Theme) {
    setTheme(next);
    window.localStorage.setItem('wurdi-theme', next);
  }

  return (
    <div className="border-glass-border-strong bg-glass inline-flex items-center gap-1 rounded-full border p-1">
      {(['dark', 'light'] as const).map((option) => {
        const Icon = option === 'dark' ? Moon : Sun;
        const isActive = theme === option;
        return (
          <button
            key={option}
            onClick={() => handleToggle(option)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              isActive ? 'bg-primary text-black' : 'text-foreground-subtle hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            {option}
          </button>
        );
      })}
    </div>
  );
}
