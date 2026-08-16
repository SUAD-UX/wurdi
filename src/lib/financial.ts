export const DEFAULT_SAVINGS_PERCENT = 20;
export const SAVINGS_PERCENT_OPTIONS = [5, 10, 20, 30, 50] as const;

export function normalizeSavingsPercent(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_SAVINGS_PERCENT;
  }

  const clamped = Math.min(100, Math.max(0, value));
  return Number(clamped.toFixed(2));
}

export function calculateSuggestedSavings(profitUsd: number, percent: number | null | undefined) {
  const normalizedPercent = normalizeSavingsPercent(percent);
  const safeProfit = Number.isFinite(profitUsd) ? Number(profitUsd) : 0;
  const savingsUsd = Number((safeProfit * (normalizedPercent / 100)).toFixed(2));
  const keepUsd = Number((safeProfit - savingsUsd).toFixed(2));

  return {
    percentage: normalizedPercent,
    profitUsd: Number(safeProfit.toFixed(2)),
    savingsUsd,
    keepUsd,
  };
}
