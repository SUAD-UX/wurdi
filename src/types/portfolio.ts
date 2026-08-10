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

export type SavingsPercentage = 5 | 10 | 20 | 30 | 50 | 'custom';

export interface SavingsPreference {
  /** The percentage the user has chosen to save from realized profit */
  selected: SavingsPercentage;
  /** Only meaningful when selected === 'custom' */
  customValue?: number;
}

export interface SavingsWallet {
  isConnected: boolean;
  address?: string;
  network?: string;
}

export interface SavingsVault {
  totalSavedUsd: number;
  changeThisMonthUsd: number;
  preference: SavingsPreference;
  wallet: SavingsWallet;
}

/** The numbers shown in a "Save from profits" preview, e.g. on $100 profit at 20% */
export interface SavingsPreview {
  profitUsd: number;
  savingsUsd: number;
  keepUsd: number;
}

export interface FeeBreakdown {
  networkFeeUsd: number;
  wurdiFeeUsd: number;
}

export interface SavingsConfirmationDetails {
  profitUsd: number;
  savingsUsd: number;
  keepUsd: number;
  destinationAddress: string;
  fees: FeeBreakdown;
}

export type TransactionStatus = 'success' | 'failed';

export interface TransactionResult {
  status: TransactionStatus;
  amountUsd: number;
  networkFeeUsd: number;
  /** Only present on failure, e.g. "Your wallet rejected the transaction." */
  reason?: string;
}

export interface InsightItem {
  id: string;
  icon: 'trend-up' | 'coins';
  title: string;
  description: string;
}
