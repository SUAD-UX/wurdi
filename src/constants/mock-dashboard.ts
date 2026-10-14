import type {
  ConnectedWallet,
  InsightItem,
  PerformancePoint,
  PnLSummary,
  PortfolioSnapshot,
  SavingsVault,
  Trade,
} from '@/types/portfolio';

export const MOCK_USER_NAME = 'Suadah';

export const MOCK_PORTFOLIO: PortfolioSnapshot = {
  totalValueUsd: 12430.68,
  changeUsd24h: 183.42,
  changePercent24h: 0.0149,
};

export const MOCK_PNL: PnLSummary = {
  daily: { valueUsd: 183.42, percent: 0.0149 },
  weekly: { valueUsd: 846.21, percent: 0.0732 },
  monthly: { valueUsd: 2103.47, percent: 0.2045 },
  allTime: { valueUsd: 12984.68, percent: 1.2835 },
};

export const MOCK_PNL_TRENDS: Record<'daily' | 'weekly' | 'monthly' | 'allTime', number[]> = {
  daily: [10, 14, 9, 16, 12, 18, 15],
  weekly: [40, 55, 48, 62, 58, 70, 66],
  monthly: [120, 150, 135, 170, 190, 175, 210],
  allTime: [200, 350, 500, 420, 680, 900, 1298],
};

export const MOCK_PERFORMANCE: PerformancePoint[] = [
  { date: 'May 29', valueUsd: 11400 },
  { date: 'May 30', valueUsd: 11150 },
  { date: 'May 31', valueUsd: 11600 },
  { date: 'Jun 1', valueUsd: 11350 },
  { date: 'Jun 2', valueUsd: 11950 },
  { date: 'Jun 3', valueUsd: 12550 },
  { date: 'Jun 4', valueUsd: 12430.68 },
];

export const MOCK_TRADES: Trade[] = [
  {
    id: 'trade-1',
    assetSymbol: 'ETH',
    assetName: 'Ethereum',
    side: 'Buy',
    timestamp: '2024-05-31T10:24:00',
    priceInUsd: 2341.0,
    priceOutUsd: 2512.5,
    pnlUsd: 171.5,
    outcome: 'Profit',
  },
  {
    id: 'trade-2',
    assetSymbol: 'SOL',
    assetName: 'Solana',
    side: 'Buy',
    timestamp: '2024-05-31T09:15:00',
    priceInUsd: 151.2,
    priceOutUsd: 162.8,
    pnlUsd: 11.6,
    outcome: 'Profit',
  },
  {
    id: 'trade-3',
    assetSymbol: 'MATIC',
    assetName: 'Polygon',
    side: 'Sell',
    timestamp: '2024-05-30T16:45:00',
    priceInUsd: 0.842,
    priceOutUsd: 0.781,
    pnlUsd: -0.061,
    outcome: 'Loss',
  },
];

export const MOCK_WALLET: ConnectedWallet = {
  address: '0x7a3F2b91C4d5E68a9b0F1c2D3e4F5061728394Ae9',
  network: 'Monad Testnet',
  isConnected: true,
  lastSyncedAgo: '2 mins ago',
};

export const MOCK_SAVINGS: SavingsVault = {
  totalSavedUsd: 1256.78,
  changeThisMonthUsd: 256.3,
  preference: { selected: 20 },
  wallet: {
    isConnected: true,
    address: '0x3f8B1a2C9d0E4f5A6b7C8d9E0f1A2b3C4d5Eab21',
    network: 'Monad Testnet',
  },
};

/** A second mock export for previewing the "no savings wallet connected" empty state. */
export const MOCK_SAVINGS_DISCONNECTED: SavingsVault = {
  totalSavedUsd: 0,
  changeThisMonthUsd: 0,
  preference: { selected: 20 },
  wallet: { isConnected: false },
};

/** Sample realized profit used to preview the savings confirmation flow. */
export const MOCK_SAVINGS_CONFIRMATION_PROFIT = 100;

export const MOCK_FEE_BREAKDOWN = {
  networkFeeUsd: 0.12,
  wurdiFeeUsd: 0, // V1 is free — see FeeBreakdown component
};

export const MOCK_INSIGHTS: InsightItem[] = [
  {
    id: 'insight-1',
    icon: 'trend-up',
    title: 'Great job!',
    description: "You're 17% better than your performance last week.",
  },
  {
    id: 'insight-2',
    icon: 'coins',
    title: 'Keep saving',
    description: "You've saved $256.30 this month. Consistency is wealth.",
  },
];
