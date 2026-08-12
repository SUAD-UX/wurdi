import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { PortfolioHeroCard } from '@/components/dashboard/PortfolioHeroCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import {
  MOCK_USER_NAME,
  MOCK_PORTFOLIO,
  MOCK_PERFORMANCE,
  MOCK_WALLET,
} from '@/constants/mock-dashboard';
import { formatCurrency } from '@/utils/format';

/** Placeholder holdings until real on-chain balances are wired in (step 8 of the build order). */
const MOCK_HOLDINGS = [
  { symbol: 'ETH', name: 'Ethereum', valueUsd: 6820.12, allocation: 0.55 },
  { symbol: 'SOL', name: 'Solana', valueUsd: 3210.4, allocation: 0.26 },
  { symbol: 'MATIC', name: 'Polygon', valueUsd: 2400.16, allocation: 0.19 },
];

export default function PortfolioPage() {
  return (
    <DashboardShell
      userName={MOCK_USER_NAME}
      walletAddress={MOCK_WALLET.address}
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <div className="flex flex-col gap-6">
        <ScrollReveal>
          <PortfolioHeroCard snapshot={MOCK_PORTFOLIO} performance={MOCK_PERFORMANCE} />
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <GlassCard className="p-6">
            <h2 className="text-foreground mb-4 text-sm font-medium">Holdings</h2>
            <div className="flex flex-col gap-1">
              {MOCK_HOLDINGS.map((holding) => (
                <div
                  key={holding.symbol}
                  className="border-glass-border flex items-center justify-between border-b py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/12 text-secondary flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold">
                      {holding.symbol.slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-foreground text-sm font-medium">{holding.symbol}</p>
                      <p className="text-foreground-subtle text-xs">{holding.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone="neutral">{Math.round(holding.allocation * 100)}%</Badge>
                    <span className="text-foreground text-sm font-medium">
                      {formatCurrency(holding.valueUsd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-foreground-subtle mt-4 text-xs">
              Placeholder holdings — real on-chain balances connect once wallet integration ships.
            </p>
          </GlassCard>
        </ScrollReveal>
      </div>
    </DashboardShell>
  );
}
