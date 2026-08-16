import Decimal from 'decimal.js';
import { getAddress } from 'ethers';

export type TradeSide = 'buy' | 'sell';

export function toDecimal(value: number | string | Decimal | null | undefined): Decimal {
  if (value === null || value === undefined || value === '') {
    return new Decimal(0);
  }

  return new Decimal(value.toString());
}

export function roundMoney(value: number | string | Decimal): number {
  return toDecimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

export function normalizeWalletAddress(address: string) {
  return getAddress(address).toLowerCase();
}

export function calculateCostBasis(quantity: number, averageEntryPrice: number, fees = 0) {
  const qty = toDecimal(quantity);
  const avg = toDecimal(averageEntryPrice);
  const fee = toDecimal(fees);

  if (qty.lte(0) || avg.lt(0) || fee.lt(0)) {
    return 0;
  }

  return roundMoney(qty.mul(avg).plus(fee));
}

export function calculateRealizedPnl({
  quantity,
  averageEntryPrice,
  proceeds,
  fees = 0,
}: {
  quantity: number;
  averageEntryPrice: number;
  proceeds: number;
  fees?: number;
}) {
  if (quantity <= 0 || averageEntryPrice < 0 || proceeds < 0) {
    return 0;
  }

  const costBasis = calculateCostBasis(quantity, averageEntryPrice, fees);
  return roundMoney(toDecimal(proceeds).minus(costBasis));
}

export function calculateUnrealizedPnl({
  quantity,
  averageEntryPrice,
  currentPrice,
}: {
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
}) {
  if (quantity <= 0 || averageEntryPrice < 0 || currentPrice < 0) {
    return 0;
  }

  return roundMoney(toDecimal(quantity).mul(currentPrice - averageEntryPrice));
}

export function calculatePortfolioSummary(holdings: Array<{ quantity: number; averageCost: number; currentPrice: number }>) {
  const totalValue = holdings.reduce((sum, holding) => {
    const value = toDecimal(holding.quantity).mul(holding.currentPrice);
    return sum.plus(value);
  }, new Decimal(0));

  const costBasis = holdings.reduce((sum, holding) => {
    const value = toDecimal(holding.quantity).mul(holding.averageCost);
    return sum.plus(value);
  }, new Decimal(0));

  const unrealizedPnl = totalValue.minus(costBasis);

  return {
    totalValueUsd: roundMoney(totalValue),
    costBasisUsd: roundMoney(costBasis),
    unrealizedPnlUsd: roundMoney(unrealizedPnl),
    changeUsd24h: 0,
    changePercent24h: 0,
  };
}

export function buildPnlSummary({
  trades,
  holdings,
}: {
  trades: Array<{ quantity: number; unitPrice: number; totalValue: number; fees: number; type: string; timestamp: string | Date }>;
  holdings: Array<{ quantity: number; averageCost: number; currentPrice: number }>;
}) {
  const realized = trades.reduce((sum, trade) => {
    const type = trade.type.toLowerCase();
    const pnl = type === 'sell'
      ? calculateRealizedPnl({
          quantity: trade.quantity,
          averageEntryPrice: trade.unitPrice,
          proceeds: trade.totalValue,
          fees: trade.fees,
        })
      : -calculateRealizedPnl({
          quantity: trade.quantity,
          averageEntryPrice: trade.unitPrice,
          proceeds: trade.totalValue,
          fees: trade.fees,
        });

    return sum + pnl;
  }, 0);

  const unrealized = holdings.reduce((sum, holding) => {
    return sum + calculateUnrealizedPnl({
      quantity: holding.quantity,
      averageEntryPrice: holding.averageCost,
      currentPrice: holding.currentPrice,
    });
  }, 0);

  const total = realized + unrealized;

  return {
    daily: { valueUsd: Number(Math.max(0, total).toFixed(2)), percent: 0 },
    weekly: { valueUsd: Number(Math.max(0, total).toFixed(2)), percent: 0 },
    monthly: { valueUsd: Number(Math.max(0, total).toFixed(2)), percent: 0 },
    allTime: { valueUsd: Number(Math.max(0, total).toFixed(2)), percent: 0 },
    realizedPnlUsd: Number(realized.toFixed(2)),
    unrealizedPnlUsd: Number(unrealized.toFixed(2)),
    totalPnlUsd: Number(total.toFixed(2)),
  };
}
