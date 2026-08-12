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
import {
  MOCK_USER_NAME,
  MOCK_PORTFOLIO,
  MOCK_PNL,
  MOCK_PNL_TRENDS,
  MOCK_PERFORMANCE,
  MOCK_TRADES,
  MOCK_WALLET,
  MOCK_SAVINGS,
  MOCK_SAVINGS_CONFIRMATION_PROFIT,
  MOCK_INSIGHTS,
} from '@/constants/mock-dashboard';

const PNL_TILES = [
  { label: 'Daily PnL', ...MOCK_PNL.daily, trend: MOCK_PNL_TRENDS.daily },
  { label: 'Weekly PnL', ...MOCK_PNL.weekly, trend: MOCK_PNL_TRENDS.weekly },
  { label: 'Monthly PnL', ...MOCK_PNL.monthly, trend: MOCK_PNL_TRENDS.monthly },
  { label: 'All Time PnL', ...MOCK_PNL.allTime, trend: MOCK_PNL_TRENDS.allTime },
];

export default function DashboardPage() {
  return (
    <DashboardShell
      userName={MOCK_USER_NAME}
      walletAddress={MOCK_WALLET.address}
      network={MOCK_WALLET.network}
      hasNotifications
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <ScrollReveal>
            <PortfolioHeroCard snapshot={MOCK_PORTFOLIO} performance={MOCK_PERFORMANCE} />
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PNL_TILES.map((tile, index) => (
              <ScrollReveal key={tile.label} delay={index * 0.06}>
                <PnLMetricCard
                  label={tile.label}
                  valueUsd={tile.valueUsd}
                  percent={tile.percent}
                  trend={tile.trend}
                />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <PerformanceOverviewCard data={MOCK_PERFORMANCE} />
          </ScrollReveal>
          <ScrollReveal>
            <RecentTradesCard trades={MOCK_TRADES} />
          </ScrollReveal>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <ScrollReveal delay={0.05}>
            <ConnectedWalletCard wallet={MOCK_WALLET} />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <SavingsVaultCard
              vault={MOCK_SAVINGS}
              previewProfitUsd={MOCK_SAVINGS_CONFIRMATION_PROFIT}
            />
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <InsightsCard insights={MOCK_INSIGHTS} />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <QuickActions />
          </ScrollReveal>
        </div>
      </div>
    </DashboardShell>
  );
}
