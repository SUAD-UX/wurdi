import { Search } from 'lucide-react';

export interface SearchTriggerProps {
  onClick: () => void;
}

/** Desktop: compact pill with a ⌘K hint. Mobile: icon-only, doesn't crowd the header. */
export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Search"
      className="border-glass-border-strong bg-glass text-foreground-subtle hover:text-foreground flex h-10 items-center gap-2 rounded-full border px-3 text-sm transition-colors sm:w-48 sm:justify-between sm:px-4"
    >
      <span className="flex items-center gap-2">
        <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span className="hidden sm:inline">Search…</span>
      </span>
      <kbd className="border-glass-border-strong hidden rounded-md border px-1.5 py-0.5 text-[10px] sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
