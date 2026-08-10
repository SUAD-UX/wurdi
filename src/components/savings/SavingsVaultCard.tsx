import { ArrowUpRight, Info, Lock, Settings2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { SavingsVault } from '@/types/portfolio';
import { formatCurrency, formatSignedCurrency, truncateAddress } from '@/utils/format';

export interface SavingsVaultCardProps {
  vault: SavingsVault;
}

export function SavingsVaultCard({ vault }: SavingsVaultCardProps) {
  return (
    <GlassCard className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-foreground flex items-center gap-1.5 text-sm font-medium">
          Savings Vault
          <Info className="text-foreground-subtle h-3.5 w-3.5" strokeWidth={2} />
        </h3>
        <Badge tone="accent">Auto Save: {vault.autoSavePercent}%</Badge>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-foreground-subtle mb-1 text-xs">Total Saved</p>
          <p className="text-foreground text-3xl font-semibold">
            {formatCurrency(vault.totalSavedUsd)}
          </p>
          <p className="text-secondary mt-1.5 flex items-center gap-1 text-xs font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            {formatSignedCurrency(vault.changeThisMonthUsd)} this month
          </p>
        </div>

        <div
          className="from-primary/25 to-secondary/10 relative flex h-20 w-20 shrink-0 items-center justify-center bg-gradient-to-br shadow-[0_20px_40px_-16px_rgba(18,185,129,0.3)]"
          style={{ borderRadius: '38% 62% 55% 45% / 45% 40% 60% 55%' }}
        >
          <Lock className="text-secondary h-8 w-8" strokeWidth={1.5} />
        </div>
      </div>

      <div className="border-glass-border mt-5 flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-foreground-subtle text-xs">Savings Wallet</p>
          <p className="text-foreground-muted text-xs">{truncateAddress(vault.vaultAddress)}</p>
        </div>
        <Button variant="secondary" size="sm">
          <Settings2 className="h-3.5 w-3.5" strokeWidth={2} />
          Manage Vault
        </Button>
      </div>
    </GlassCard>
  );
}
