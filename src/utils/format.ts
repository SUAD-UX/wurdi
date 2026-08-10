/**
 * Formats a number as USD currency, e.g. 12430.68 -> "$12,430.68"
 */
export function formatCurrency(
  value: number,
  options?: { maximumFractionDigits?: number },
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

/**
 * Formats a fractional change as a signed percentage, e.g. 0.0149 -> "+1.49%"
 */
export function formatPercent(value: number, options?: { signed?: boolean }): string {
  const signed = options?.signed ?? true;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  if (!signed) return formatted;
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

/**
 * Truncates a wallet address to the standard "0x7a...91Ae9" display form.
 */
export function truncateAddress(address: string, leading = 4, trailing = 5): string {
  if (address.length <= leading + trailing) return address;
  return `${address.slice(0, leading + 2)}...${address.slice(-trailing)}`;
}

/**
 * Formats a signed dollar delta, e.g. 183.42 -> "+$183.42", -0.061 -> "-$0.06"
 */
export function formatSignedCurrency(value: number): string {
  const formatted = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}
