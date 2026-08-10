import type { SavingsPercentage, SavingsPreference, SavingsPreview } from '@/types/portfolio';

/** The percentage choices shown in the SavingsPercentageSelector popover. */
export const SAVINGS_PERCENTAGE_OPTIONS: SavingsPercentage[] = [5, 10, 20, 30, 50, 'custom'];

/** Resolves a SavingsPercentage (which may be the literal 'custom') to a usable number 0-100. */
export function resolveSavingsPercent(preference: SavingsPreference): number {
  if (preference.selected === 'custom') {
    return preference.customValue ?? 0;
  }
  return preference.selected;
}

/** Computes the save/keep split for a given profit at the user's chosen percentage. */
export function calculateSavingsPreview(
  profitUsd: number,
  preference: SavingsPreference,
): SavingsPreview {
  const percent = resolveSavingsPercent(preference);
  const savingsUsd = Math.round(profitUsd * (percent / 100) * 100) / 100;
  return {
    profitUsd,
    savingsUsd,
    keepUsd: Math.round((profitUsd - savingsUsd) * 100) / 100,
  };
}

/** Formats a SavingsPercentage for display, e.g. 20 -> "20%", 'custom' -> "Custom". */
export function formatSavingsPercentageLabel(value: SavingsPercentage): string {
  return value === 'custom' ? 'Custom' : `${value}%`;
}
