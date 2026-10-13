import { BarChart3 } from 'lucide-react';
import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { PerformanceOverviewCard } from '@/components/dashboard/PerformanceOverviewCard';
import { InsightsCard } from '@/components/analytics/InsightsCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { prisma } from '@/lib/db';
import { MOCK_WALLET } from '@/constants/mock-dashboard';

export default async function AnalyticsPage() {
  const currentUser = await getAuthenticatedUser();
  const tradeCount = currentUser
    ? await prisma.tradeRecord.count({ where: { userId: currentUser.id } })
    : 0;

  const holdingsCount = currentUser
    ? await prisma.portfolioHolding.count({ where: { userId: currentUser.id } })
    : 0;

  return (
    <DashboardShell
      userName={currentUser?.displayName ?? ''}
      walletAddress={currentUser?.walletAddress ?? ''}
      network={currentUser?.network ?? MOCK_WALLET.network}
      hasNotifications
    >
      {tradeCount === 0 && holdingsCount === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Portfolio metrics and PnL history will appear here once the authenticated wallet has real holdings or trade records."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <ScrollReveal>
            <PerformanceOverviewCard data={[]} />
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <InsightsCard insights={[]} />
          </ScrollReveal>
        </div>
      )}
    </DashboardShell>
  );
}
