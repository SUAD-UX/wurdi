import { Wallet } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { PortfolioHeroCard } from '@/components/dashboard/PortfolioHeroCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { prisma } from '@/lib/db';
import { calculatePortfolioSummary } from '@/lib/pnl';
import { MOCK_USER_NAME, MOCK_WALLET } from '@/constants/mock-dashboard';
import { formatCurrency } from '@/utils/format';

export default async function PortfolioPage() {
  const currentUser = await getAuthenticatedUser();
  const holdingRecords = currentUser
    ? await prisma.portfolioHolding.findMany({
        where: { userId: currentUser.id },
        include: { asset: true },
        orderBy: { updatedAt: 'desc' },
      })
    : [];

  const holdings = holdingRecords.map((holding) => ({
    symbol: holding.asset.symbol,
    name: holding.asset.name,
    quantity: Number(holding.quantity),
    averageCost: Number(holding.averageCost),
    currentPrice: Number(holding.currentPrice),
    valueUsd: Number(holding.totalValue),
    allocation: 0,
  }));

  const summary = calculatePortfolioSummary(
    holdingRecords.map((holding) => ({
      quantity: Number(holding.quantity),
      averageCost: Number(holding.averageCost),
      currentPrice: Number(holding.currentPrice),
    })),
  );

  const performance = holdingRecords.map((holding, index) => ({
    date: `Point ${index + 1}`,
    valueUsd: Number(holding.totalValue),
  }));

  return (
    <DashboardShell
      userName={currentUser?.displayName ?? MOCK_USER_NAME}
      walletAddress={currentUser?.walletAddress ?? MOCK_WALLET.address}
      network={currentUser?.network ?? MOCK_WALLET.network}
      hasNotifications
    >
      {holdingRecords.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No portfolio data yet"
          description="Once a linked wallet has real holdings or a provider-backed snapshot, WURDI will show the authenticated portfolio here."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <ScrollReveal>
            <PortfolioHeroCard
              snapshot={summary}
              performance={performance.length > 0 ? performance : [{ date: 'Now', valueUsd: summary.totalValueUsd }]}
            />
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <GlassCard className="p-6">
              <h2 className="text-foreground mb-4 text-sm font-medium">Holdings</h2>
              <div className="flex flex-col gap-1">
                {holdings.map((holding) => (
                  <div
                    key={`${holding.symbol}-${holding.name}`}
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
                      <Badge tone="neutral">{Math.round((holding.valueUsd / Math.max(summary.totalValueUsd, 1)) * 100)}%</Badge>
                      <span className="text-foreground text-sm font-medium">{formatCurrency(holding.valueUsd)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      )}
    </DashboardShell>
  );
}
