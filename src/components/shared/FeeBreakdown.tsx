import { formatCurrency } from '@/utils/format';

export interface FeeBreakdownProps {
  networkFeeUsd: number;
  wurdiFeeUsd: number;
}

/**
 * Always shows Network fee and WURDI fee as two distinct lines — never combined —
 * per the requirement that users can tell blockchain costs apart from anything WURDI
 * charges. V1 is free, so wurdiFeeUsd will always render as $0.00 for now.
 */
export function FeeBreakdown({ networkFeeUsd, wurdiFeeUsd }: FeeBreakdownProps) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <dt className="text-foreground-subtle">Estimated network fee</dt>
        <dd className="text-foreground">{formatCurrency(networkFeeUsd)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-foreground-subtle">WURDI fee</dt>
        <dd className="text-secondary">{formatCurrency(wurdiFeeUsd)}</dd>
      </div>
    </dl>
  );
}
