'use client';

import { useEffect, useState, useCallback } from 'react';
import { PortfolioHeroCard } from '@/components/dashboard/PortfolioHeroCard';
import { PnLMetricCard } from '@/components/pnl/PnLMetricCard';
import { PerformanceOverviewCard } from '@/components/dashboard/PerformanceOverviewCard';
import { RecentTradesCard } from '@/components/dashboard/RecentTradesCard';
import { ConnectedWalletCard } from '@/components/wallet/ConnectedWalletCard';
import { SavingsVaultCard } from '@/components/savings/SavingsVaultCard';
import { InsightsCard } from '@/components/analytics/InsightsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import type { PortfolioSnapshot, PerformancePoint, PnLSummary, Trade, ConnectedWallet, SavingsVault, InsightItem } from '@/types/portfolio';

interface TradeApiItem {
  id: string;
  assetSymbol: string;
  assetName: string;
  type: string;
  timestamp: string;
  unitPrice: number;
}

interface TradesApiResponse {
  ok?: boolean;
  data: TradeApiItem[];
}

interface SavingsApiResponse {
  ok?: boolean;
  data?: {
    percentage?: number;
    wallet?: SavingsVault['wallet'];
  };
}

function mapSavingsResponse(body: SavingsApiResponse): SavingsVault | null {
  if (!body.ok || !body.data) {
    return null;
  }

  const percentage = Number(body.data.percentage ?? 20);
  const standardPercentage = ([5, 10, 20, 30, 50] as const).find((option) => option === percentage);
  const preference: SavingsVault['preference'] = standardPercentage !== undefined
    ? { selected: standardPercentage }
    : { selected: 'custom', customValue: Number.isFinite(percentage) ? percentage : 20 };

  return {
    totalSavedUsd: 0,
    changeThisMonthUsd: 0,
    preference,
    wallet: body.data.wallet ?? { isConnected: false },
  };
}

export function DashboardLive() {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [pnl, setPnl] = useState<PnLSummary | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [wallet, setWallet] = useState<ConnectedWallet>({ address: '', network: 'Monad Testnet', isConnected: false, lastSyncedAgo: 'Never' });
  const [savings, setSavings] = useState<SavingsVault | null>(null);
  const [savingsMenuOpen, setSavingsMenuOpen] = useState(false);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // session/user
      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      const sessionData = await sessionRes.json().catch(() => ({}));
      if (sessionData?.authenticated && sessionData?.user?.walletAddress) {
        setWallet((w) => ({ ...w, address: sessionData.user.walletAddress, isConnected: true }));
      }

      // portfolio
      const [portfolioRes, pnlRes, tradesRes, savingsRes, insightsRes] = await Promise.all([
        fetch('/api/portfolio', { cache: 'no-store' }),
        fetch('/api/pnl', { cache: 'no-store' }),
        fetch('/api/trades', { cache: 'no-store' }),
        fetch('/api/savings', { cache: 'no-store' }),
        fetch('/api/analytics', { cache: 'no-store' }),
      ]);

      if (portfolioRes.ok) {
        const body = await portfolioRes.json();
        if (body?.ok) {
          setPortfolio(body.data.summary || null);
        }
      }

      if (pnlRes.ok) {
        const body = await pnlRes.json();
        if (body?.ok) {
          setPnl(body.data || null);
        }
      }

      if (tradesRes.ok) {
        const body: TradesApiResponse = await tradesRes.json();
        if (body?.ok) {
          const mapped: Trade[] = body.data.map((t) => ({
            id: t.id,
            assetSymbol: t.assetSymbol,
            assetName: t.assetName,
            side: t.type === 'buy' ? 'Buy' : 'Sell',
            timestamp: t.timestamp,
            priceInUsd: Number(t.unitPrice ?? 0),
            priceOutUsd: Number(t.unitPrice ?? 0),
            pnlUsd: 0,
            outcome: 'Profit',
          }));
          setTrades(mapped);
        }
      }

      if (savingsRes.ok) {
        const body: SavingsApiResponse = await savingsRes.json();
        setSavings(mapSavingsResponse(body));
      }

      if (insightsRes.ok) {
        const body = await insightsRes.json();
        if (body?.ok && Array.isArray(body.data)) {
          setInsights(body.data);
        } else {
          setInsights([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchAll);
    const handler = () => void fetchAll();
    window.addEventListener('wurdi:sync', handler);
    return () => window.removeEventListener('wurdi:sync', handler);
  }, [fetchAll]);

  // Only render performance points supplied by a data source.
  const perf: PerformancePoint[] = performance;

  const snapshot: PortfolioSnapshot = portfolio ?? { totalValueUsd: 0, changeUsd24h: 0, changePercent24h: 0 };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <ScrollReveal>
            <PortfolioHeroCard snapshot={snapshot} performance={perf} />
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['Daily PnL','Weekly PnL','Monthly PnL','All Time PnL'].map((label) => {
                const period = label.toLowerCase().split(' ')[0];
                const periodPnl = period === 'daily'
                  ? pnl?.daily
                  : period === 'weekly'
                    ? pnl?.weekly
                    : period === 'monthly'
                      ? pnl?.monthly
                      : undefined;

                return (
                  <PnLMetricCard
                    key={label}
                    label={label}
                    valueUsd={periodPnl?.valueUsd ?? 0}
                    percent={periodPnl?.percent ?? 0}
                    trend={[]}
                  />
                );
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <PerformanceOverviewCard data={perf} />
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <RecentTradesCard trades={trades} />
          </ScrollReveal>
        </div>

        <div className="flex flex-col gap-6">
          <ScrollReveal delay={0.05}>
            <ConnectedWalletCard wallet={wallet} />
          </ScrollReveal>
          <ScrollReveal delay={0.1} className={savingsMenuOpen ? 'relative z-40' : undefined}>
            <SavingsVaultCard
              key={savings ? 'loaded-savings' : 'default-savings'}
              vault={savings ?? { totalSavedUsd: 0, changeThisMonthUsd: 0, preference: { selected: 20 }, wallet: { isConnected: wallet.isConnected, address: wallet.address } }}
              previewProfitUsd={0}
              onDropdownOpenChange={setSavingsMenuOpen}
            />
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <InsightsCard insights={insights} />
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <QuickActions />
          </ScrollReveal>
        </div>
      </div>

      {loading && <div className="mt-4 text-sm text-foreground-subtle">Loading dashboard data...</div>}
      {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}
    </>
  );
}
