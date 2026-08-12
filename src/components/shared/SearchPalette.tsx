'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, LayoutGrid, Search } from 'lucide-react';
import { searchWurdi } from '@/services/search';
import type { SearchResultItem } from '@/types/search';
import { cn } from '@/lib/utils';

export interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const KIND_ICON = {
  nav: LayoutGrid,
  trade: ArrowRightLeft,
  asset: ArrowRightLeft,
  goal: LayoutGrid,
} as const;

/**
 * Cmd/Ctrl+K search modal. Debounced query -> searchWurdi() -> results list.
 * Only depends on SearchResultItem, so swapping the mock searchWurdi() for a
 * real backend call later requires no changes here.
 */
export function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Rendered as a fresh component instance each time the palette opens (see
  // !isOpen check above), so query/results naturally start empty without an
  // effect that resets state on every open — React docs' recommended pattern
  // over "adjusting state in response to a prop change."
  return <SearchPaletteDialog onClose={onClose} />;
}

function SearchPaletteDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchWurdi(query).then(setResults);
    }, 120);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelect(item: SearchResultItem) {
    router.push(item.href);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[15vh]">
      <button
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search WURDI"
        className="border-glass-border-strong bg-background-elevated/95 relative w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-[var(--glass-blur)]"
      >
        <div className="border-glass-border flex items-center gap-3 border-b px-4 py-3">
          <Search className="text-foreground-subtle h-4 w-4 shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search portfolio, trades, pages…"
            className="text-foreground placeholder:text-foreground-subtle min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="border-glass-border-strong text-foreground-subtle hidden rounded-md border px-1.5 py-0.5 text-[10px] sm:inline">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <p className="text-foreground-subtle px-3 py-6 text-center text-sm">
              Start typing to search across WURDI.
            </p>
          ) : results.length === 0 ? (
            <p className="text-foreground-subtle px-3 py-6 text-center text-sm">
              No results for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <ul>
              {results.map((item) => {
                const Icon = KIND_ICON[item.kind];
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        'hover:bg-white/[0.05]',
                      )}
                    >
                      <span className="bg-primary/12 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <Icon className="text-secondary h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground block truncate text-sm font-medium">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-foreground-subtle block truncate text-xs">
                            {item.subtitle}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
