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

  useEffect(() => {
    let cancelled = false;

    async function loadTheme() {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const data = await response.json();
        if (!cancelled && data?.user?.preferences?.theme) {
          setTheme(data.user.preferences.theme);
          document.documentElement.dataset.theme = data.user.preferences.theme;
          return;
        }
      } catch {
        const stored = window.localStorage.getItem('wurdi-theme') as Theme | null;
        if (!cancelled && stored) {
          setTheme(stored);
          document.documentElement.dataset.theme = stored;
        }
      }
    }

    void loadTheme();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function handleToggle(next: Theme) {
    setTheme(next);
    window.localStorage.setItem('wurdi-theme', next);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: next }),
      });

      if (!response.ok) {
        return;
      }
    } catch {
      // Ignore storage-only fallback when a user is not authenticated.
    }
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
