import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';
import { PortfolioHeroCard } from '@/components/dashboard/PortfolioHeroCard';
import { PnLMetricCard } from '@/components/pnl/PnLMetricCard';
import { PerformanceOverviewCard } from '@/components/dashboard/PerformanceOverviewCard';
import { RecentTradesCard } from '@/components/dashboard/RecentTradesCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ConnectedWalletCard } from '@/components/wallet/ConnectedWalletCard';
import { SavingsVaultCard } from '@/components/savings/SavingsVaultCard';
import { InsightsCard } from '@/components/analytics/InsightsCard';
import {
  MOCK_USER_NAME,
  MOCK_PORTFOLIO,
  MOCK_PNL,
  MOCK_PNL_TRENDS,
  MOCK_PERFORMANCE,
  MOCK_TRADES,
  MOCK_WALLET,
  MOCK_SAVINGS,
  MOCK_INSIGHTS,
} from '@/constants/mock-dashboard';

export default function DashboardPage() {
  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar userName={MOCK_USER_NAME} walletAddress={MOCK_WALLET.address} />

      <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
          <Topbar userName={MOCK_USER_NAME} network={MOCK_WALLET.network} hasNotifications />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <PortfolioHeroCard snapshot={MOCK_PORTFOLIO} performance={MOCK_PERFORMANCE} />

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <PnLMetricCard
                  label="Daily PnL"
                  valueUsd={MOCK_PNL.daily.valueUsd}
                  percent={MOCK_PNL.daily.percent}
                  trend={MOCK_PNL_TRENDS.daily}
                />
                <PnLMetricCard
                  label="Weekly PnL"
                  valueUsd={MOCK_PNL.weekly.valueUsd}
                  percent={MOCK_PNL.weekly.percent}
                  trend={MOCK_PNL_TRENDS.weekly}
                />
                <PnLMetricCard
                  label="Monthly PnL"
                  valueUsd={MOCK_PNL.monthly.valueUsd}
                  percent={MOCK_PNL.monthly.percent}
                  trend={MOCK_PNL_TRENDS.monthly}
                />
                <PnLMetricCard
                  label="All Time PnL"
                  valueUsd={MOCK_PNL.allTime.valueUsd}
                  percent={MOCK_PNL.allTime.percent}
                  trend={MOCK_PNL_TRENDS.allTime}
                />
              </div>

              <PerformanceOverviewCard data={MOCK_PERFORMANCE} />
              <RecentTradesCard trades={MOCK_TRADES} />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <ConnectedWalletCard wallet={MOCK_WALLET} />
              <SavingsVaultCard vault={MOCK_SAVINGS} />
              <InsightsCard insights={MOCK_INSIGHTS} />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
