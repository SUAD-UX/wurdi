'use client';

import { useState } from 'react';
import { ArrowUpRight, Info, Settings2, Wallet } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { SavingsPercentageSelector } from '@/components/savings/SavingsPercentageSelector';
import { VaultCore } from '@/components/savings/VaultCore';
import type { SavingsPreference, SavingsVault } from '@/types/portfolio';
import { calculateSavingsPreview } from '@/features/savings/calculations';
import { formatCurrency, formatSignedCurrency, truncateAddress } from '@/utils/format';
import { cn } from '@/lib/utils';

export interface SavingsVaultCardProps {
  vault: SavingsVault;
  /** Sample profit used only to render the "Every time I make +$100..." preview line. */
  previewProfitUsd: number;
  onManageVault?: () => void;
  onConnectWallet?: () => void;
  onDropdownOpenChange?: (isOpen: boolean) => void;
  pulse?: boolean;
}

/**
 * Savings Vault card. Two states:
 *  - wallet.isConnected === false -> empty state with a "Connect savings wallet" CTA
 *  - wallet.isConnected === true  -> totals + percentage selector + live preview + address
 * The percentage itself is local component state for now (see SavingsPercentageSelector
 * docblock) — no persistence layer until auth/wallet/backend land.
 */
export function SavingsVaultCard({
  vault,
  previewProfitUsd,
  onManageVault,
  onConnectWallet,
  onDropdownOpenChange,
  pulse = false,
}: SavingsVaultCardProps) {
  const [preference, setPreference] = useState<SavingsPreference>(vault.preference);
  const [percentageMenuOpen, setPercentageMenuOpen] = useState(false);
  const preview = calculateSavingsPreview(previewProfitUsd, preference);
  const monthlyChangeUsd = Number.isFinite(vault.changeThisMonthUsd)
    ? vault.changeThisMonthUsd
    : 0;

  return (
    <GlassCard className={cn('p-6', percentageMenuOpen && 'z-40')}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-foreground flex items-center gap-1.5 text-sm font-medium">
          Savings Vault
          <Info className="text-foreground-subtle h-3.5 w-3.5" strokeWidth={2} />
        </h3>
      </div>

      {!vault.wallet.isConnected ? (
        <div className="border-glass-border-strong flex flex-col items-center gap-3 rounded-2xl border border-dashed py-8 text-center">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
            <Wallet className="text-secondary h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="text-foreground-subtle max-w-[220px] text-sm">
            Your savings wallet isn&apos;t connected yet.
          </p>
          <Button variant="secondary" size="sm" onClick={onConnectWallet}>
            Connect savings wallet
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground-subtle mb-1 text-xs">Total Saved</p>
              <p className="text-foreground text-3xl font-semibold">
                {formatCurrency(vault.totalSavedUsd)}
              </p>
              <p className="text-secondary mt-1.5 flex items-center gap-1 text-xs font-medium">
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                {monthlyChangeUsd === 0
                  ? formatCurrency(0)
                  : formatSignedCurrency(monthlyChangeUsd)} this month
              </p>
            </div>

            <VaultCore pulse={pulse} />
          </div>

          <div className="border-glass-border mt-5 rounded-2xl border bg-white/[0.015] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-foreground-muted text-sm">Save from profits</span>
              <SavingsPercentageSelector
                value={preference}
                onChange={setPreference}
                onOpenChange={(isOpen) => {
                  setPercentageMenuOpen(isOpen);
                  onDropdownOpenChange?.(isOpen);
                }}
              />
            </div>
            <div className="text-foreground-subtle space-y-1.5 text-xs">
              <p>
                Every time I make{' '}
                <span className="text-foreground font-medium">
                  {formatSignedCurrency(preview.profitUsd)}
                </span>{' '}
                profit
              </p>
              <p>
                WURDI saves{' '}
                <span className="text-secondary font-medium">
                  {formatCurrency(preview.savingsUsd)}
                </span>
              </p>
              <p>
                I keep{' '}
                <span className="text-foreground font-medium">
                  {formatCurrency(preview.keepUsd)}
                </span>
              </p>
            </div>
          </div>

          <div className="border-glass-border mt-4 flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-foreground-subtle text-xs">Savings Wallet</p>
              <p className="text-foreground-muted text-xs">
                {vault.wallet.address ? truncateAddress(vault.wallet.address) : '—'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={onManageVault}>
              <Settings2 className="h-3.5 w-3.5" strokeWidth={2} />
              Manage Vault
            </Button>
          </div>
        </>
      )}
    </GlassCard>
  );
}
