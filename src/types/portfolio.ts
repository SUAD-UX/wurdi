export interface PortfolioSnapshot {
  totalValueUsd: number;
  changeUsd24h: number;
  changePercent24h: number;
}

export interface PnLSummary {
  daily: { valueUsd: number; percent: number };
  weekly: { valueUsd: number; percent: number };
  monthly: { valueUsd: number; percent: number };
  allTime: { valueUsd: number; percent: number };
}

export interface PerformancePoint {
  date: string;
  valueUsd: number;
}

export type TimeRange = '24H' | '7D' | '30D' | '90D' | '1Y' | 'All';

export type TradeSide = 'Buy' | 'Sell';
export type TradeOutcome = 'Profit' | 'Loss';

export interface Trade {
  id: string;
  assetSymbol: string;
  assetName: string;
  side: TradeSide;
  timestamp: string;
  priceInUsd: number;
  priceOutUsd: number;
  pnlUsd: number;
  outcome: TradeOutcome;
}

export interface ConnectedWallet {
  address: string;
  network: string;
  isConnected: boolean;
  lastSyncedAgo: string;
}

export interface SavingsVault {
  totalSavedUsd: number;
  changeThisMonthUsd: number;
  autoSavePercent: number;
  vaultAddress: string;
}

export interface InsightItem {
  id: string;
  icon: 'trend-up' | 'coins';
  title: string;
  description: string;
}
