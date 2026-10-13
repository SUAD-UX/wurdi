import { BarChart3 } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { RecentTradesCard } from '@/components/dashboard/RecentTradesCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { prisma } from '@/lib/db';
import { MOCK_WALLET } from '@/constants/mock-dashboard';

export default async function TradesPage() {
  const currentUser = await getAuthenticatedUser();
  const trades = currentUser
    ? await prisma.tradeRecord.findMany({
        where: { userId: currentUser.id },
        include: { asset: true },
        orderBy: { timestamp: 'desc' },
        take: 20,
      })
    : [];

  const normalizedTrades: Array<{
    id: string;
    assetSymbol: string;
    assetName: string;
    side: 'Buy' | 'Sell';
    timestamp: string;
    priceInUsd: number;
    priceOutUsd: number;
    pnlUsd: number;
    outcome: 'Profit' | 'Loss';
  }> = trades.map((trade) => ({
    id: trade.id,
    assetSymbol: trade.asset.symbol,
    assetName: trade.asset.name,
    side: trade.type === 'sell' ? 'Sell' : 'Buy',
    timestamp: trade.timestamp.toISOString(),
    priceInUsd: Number(trade.unitPrice),
    priceOutUsd: Number(trade.totalValue),
    pnlUsd: 0,
    outcome: 'Profit',
  }));

  return (
    <DashboardShell
      userName={currentUser?.displayName ?? ''}
      walletAddress={currentUser?.walletAddress ?? ''}
      network={currentUser?.network ?? MOCK_WALLET.network}
      hasNotifications
    >
      {normalizedTrades.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No trade history yet"
          description="WURDI will show authenticated trade records here when blockchain data has been ingested for the signed-in wallet."
        />
      ) : (
        <ScrollReveal>
          <RecentTradesCard trades={normalizedTrades} />
        </ScrollReveal>
      )}
    </DashboardShell>
  );
}
