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
import type { PortfolioSnapshot, PerformancePoint, Trade, ConnectedWallet, SavingsVault, InsightItem } from '@/types/portfolio';

export function DashboardLive() {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [pnl, setPnl] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [wallet, setWallet] = useState<ConnectedWallet>({ address: '', network: 'Ethereum Mainnet', isConnected: false, lastSyncedAgo: 'Never' });
  const [savings, setSavings] = useState<SavingsVault | null>(null);
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
        const body = await tradesRes.json();
        if (body?.ok) {
          const mapped: Trade[] = body.data.map((t: any) => ({
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
        const body = await savingsRes.json();
        if (body?.ok) setSavings(body.data || null);
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
    void fetchAll();
    const handler = () => void fetchAll();
    window.addEventListener('wurdi:sync', handler);
    return () => window.removeEventListener('wurdi:sync', handler);
  }, [fetchAll]);

  // Build performance data fallback
  const perf: PerformancePoint[] = performance.length ? performance : [
    { date: new Date().toISOString().slice(0,10), valueUsd: portfolio?.totalValueUsd ?? 0 },
  ];

  const snapshot: PortfolioSnapshot = portfolio ?? { totalValueUsd: 0, changeUsd24h: 0, changePercent24h: 0 };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <PortfolioHeroCard snapshot={snapshot} performance={perf} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Daily PnL','Weekly PnL','Monthly PnL','All Time PnL'].map((label, i) => (
              <PnLMetricCard
                key={label}
                label={label}
                valueUsd={(pnl && pnl[label.toLowerCase().split(' ')[0]]?.valueUsd) ?? 0}
                percent={(pnl && pnl[label.toLowerCase().split(' ')[0]]?.percent) ?? 0}
                trend={[]}
              />
            ))}
          </div>

          <PerformanceOverviewCard data={perf} />
          <RecentTradesCard trades={trades} />
        </div>

        <div className="flex flex-col gap-6">
          <ConnectedWalletCard wallet={wallet} />
          <SavingsVaultCard vault={savings ?? { totalSavedUsd: 0, changeThisMonthUsd: 0, preference: { selected: 20 }, wallet: { isConnected: wallet.isConnected, address: wallet.address } }} previewProfitUsd={0} />
          <InsightsCard insights={insights} />
          <QuickActions />
        </div>
      </div>

      {loading && <div className="mt-4 text-sm text-foreground-subtle">Loading dashboard data...</div>}
      {error && <div className="mt-4 text-sm text-rose-400">{error}</div>}
    </>
  );
}
