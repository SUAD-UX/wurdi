import { CheckCircle2, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { TransactionResult } from '@/types/portfolio';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';

export interface TransactionStatusProps {
  result: TransactionResult;
}

/**
 * Post-transfer feedback. Two restrained states — soft emerald for success, soft
 * coral for failure. Colors are pulled from the same design tokens as everywhere
 * else (--color-primary / --color-loss), not separate "alert" colors, so it stays
 * consistent with the rest of the palette rather than reading as a system alert.
 */
export function TransactionStatus({ result }: TransactionStatusProps) {
  const isSuccess = result.status === 'success';

  return (
    <GlassCard
      className={cn(
        'max-w-sm border p-6',
        isSuccess ? 'border-primary/25 bg-primary/[0.05]' : 'border-loss/25 bg-loss/[0.05]',
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        {isSuccess ? (
          <CheckCircle2 className="text-secondary h-5 w-5" strokeWidth={1.75} />
        ) : (
          <XCircle className="text-loss h-5 w-5" strokeWidth={1.75} />
        )}
        <p className={cn('text-sm font-medium', isSuccess ? 'text-secondary' : 'text-loss')}>
          {isSuccess ? 'Savings secured' : 'Savings transfer not completed'}
        </p>
      </div>

      {isSuccess ? (
        <div className="text-foreground-subtle space-y-1 text-sm">
          <p>{formatCurrency(result.amountUsd)} moved to your savings wallet.</p>
          <p>Network fee: {formatCurrency(result.networkFeeUsd)}</p>
          <p className="text-foreground-subtle pt-1 text-xs">Transaction confirmed.</p>
        </div>
      ) : (
        <div className="text-foreground-subtle space-y-1 text-sm">
          <p>{result.reason ?? 'Your wallet rejected the transaction.'}</p>
          <p className="text-foreground-subtle pt-1 text-xs">Nothing was transferred.</p>
        </div>
      )}
    </GlassCard>
  );
}
