import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { FeeBreakdown } from '@/components/shared/FeeBreakdown';
import type { SavingsConfirmationDetails } from '@/types/portfolio';
import { formatCurrency, truncateAddress } from '@/utils/format';

export interface SavingsConfirmationProps {
  details: SavingsConfirmationDetails;
  onConfirm: () => void;
  onDecline: () => void;
}

/**
 * "WURDI wants to save $X from your trading profit" — the explicit-authorization
 * step before any savings transfer happens. This is a UI/state concern only: no
 * real transaction is sent here. WURDI never has standing permission to move funds;
 * every transfer requires the user to press Confirm here first.
 */
export function SavingsConfirmation({ details, onConfirm, onDecline }: SavingsConfirmationProps) {
  return (
    <GlassCard strong className="max-w-sm p-6">
      <p className="text-foreground mb-5 text-sm leading-relaxed">
        WURDI wants to save{' '}
        <span className="text-secondary font-semibold">{formatCurrency(details.savingsUsd)}</span>{' '}
        from your trading profit.
      </p>

      <dl className="border-glass-border mb-5 space-y-2.5 rounded-2xl border bg-white/[0.015] p-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-foreground-subtle">Profit</dt>
          <dd className="text-foreground">{formatCurrency(details.profitUsd)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-foreground-subtle">Savings</dt>
          <dd className="text-secondary font-medium">{formatCurrency(details.savingsUsd)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-foreground-subtle">You keep</dt>
          <dd className="text-foreground">{formatCurrency(details.keepUsd)}</dd>
        </div>
        <div className="border-glass-border flex items-center justify-between border-t pt-2.5">
          <dt className="text-foreground-subtle">Destination</dt>
          <dd className="text-foreground">{truncateAddress(details.destinationAddress)}</dd>
        </div>
      </dl>

      <div className="mb-6">
        <FeeBreakdown
          networkFeeUsd={details.fees.networkFeeUsd}
          wurdiFeeUsd={details.fees.wurdiFeeUsd}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="md" className="flex-1" onClick={onDecline}>
          No
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </GlassCard>
  );
}
