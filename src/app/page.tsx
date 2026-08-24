import { DashboardShell } from '@/components/shared/DashboardShell';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { PortfolioHeroCard } from '@/components/dashboard/PortfolioHeroCard';
import { PnLMetricCard } from '@/components/pnl/PnLMetricCard';
import { PerformanceOverviewCard } from '@/components/dashboard/PerformanceOverviewCard';
import { RecentTradesCard } from '@/components/dashboard/RecentTradesCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ConnectedWalletCard } from '@/components/wallet/ConnectedWalletCard';
import { SavingsVaultCard } from '@/components/savings/SavingsVaultCard';
import { InsightsCard } from '@/components/analytics/InsightsCard';
import { DashboardLive } from '@/components/dashboard/DashboardLive';


export default function DashboardPage() {
  return (
    <DashboardShell userName={''} walletAddress={''} network={''} hasNotifications>
      <ScrollReveal>
        <DashboardLive />
      </ScrollReveal>
    </DashboardShell>
  );
}
