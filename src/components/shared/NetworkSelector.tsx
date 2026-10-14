import { ChevronDown, Globe } from 'lucide-react';

const comingSoonNetworks = ['Base', 'Solana'];

export function NetworkSelector() {
  return (
    <details className="group relative">
      <summary
        aria-label="Network: Monad Testnet"
        className="border-glass-border-strong bg-glass text-foreground-muted hover:text-foreground flex h-10 cursor-pointer list-none items-center gap-2 rounded-full border px-3 text-sm transition-colors sm:px-4 [&::-webkit-details-marker]:hidden"
      >
        <Globe className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span>Monad Testnet</span>
        <span className="rounded-full border border-secondary/25 bg-secondary/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-secondary">
          MONAD
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-glass-border-strong bg-background-elevated absolute right-0 z-50 mt-2 w-48 rounded-2xl border p-2 shadow-[var(--shadow-ambient)]">
        <p className="text-foreground-subtle px-2 py-1.5 text-xs font-medium">Network</p>
        <div className="flex items-center justify-between rounded-xl bg-secondary/10 px-2 py-2 text-sm text-secondary">
          <span>Monad Testnet</span>
          <span className="text-[9px] font-semibold tracking-wide">MONAD</span>
        </div>
        {comingSoonNetworks.map((network) => (
          <div
            key={network}
            className="text-foreground-subtle flex items-center justify-between px-2 py-2 text-sm"
          >
            <span>{network}</span>
            <span className="rounded-full border border-glass-border px-1.5 py-0.5 text-[10px]">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}
