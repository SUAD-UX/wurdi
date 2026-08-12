import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { PerformanceOverviewCard } from '@/components/dashboard/PerformanceOverviewCard';
import { InsightsCard } from '@/components/analytics/InsightsCard';
import {
  MOCK_USER_NAME,
  MOCK_PERFORMANCE,
  MOCK_INSIGHTS,
  MOCK_WALLET,
} from '@/constants/mock-dashboard';

export default function AnalyticsPage() {
  return (
    <DashboardShell
      userName={MOCK_USER_NAME}
      walletAddress={MOCK_WALLET.address}
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <div className="flex flex-col gap-6">
        <ScrollReveal>
          <PerformanceOverviewCard data={MOCK_PERFORMANCE} />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <InsightsCard insights={MOCK_INSIGHTS} />
        </ScrollReveal>
      </div>
    </DashboardShell>
  );
}
