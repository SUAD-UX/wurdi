import { Copy, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { ConnectedWallet } from '@/types/portfolio';
import { truncateAddress } from '@/utils/format';

export interface ConnectedWalletCardProps {
  wallet: ConnectedWallet;
}

export function ConnectedWalletCard({ wallet }: ConnectedWalletCardProps) {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-medium">Connected Wallet</h3>
        {wallet.isConnected && (
          <span className="text-secondary flex items-center gap-1.5 text-xs">
            <span className="bg-secondary h-1.5 w-1.5 rounded-full" />
            Connected
          </span>
        )}
      </div>

      <div className="mb-5 flex items-center gap-4">
        <div className="bg-primary/12 flex h-12 w-12 items-center justify-center rounded-full">
          <div className="from-secondary to-primary h-6 w-6 rounded-full bg-gradient-to-br" />
        </div>
        <div className="min-w-0">
          <button className="text-foreground hover:text-secondary flex items-center gap-1.5 text-base font-medium">
            {truncateAddress(wallet.address)}
            <Copy className="text-foreground-subtle h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <p className="text-foreground-subtle text-xs">{wallet.network}</p>
        </div>
      </div>

      <div className="border-glass-border flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-foreground-subtle text-xs">Portfolio Sync</p>
          <p className="text-foreground-muted text-xs">{wallet.lastSyncedAgo}</p>
        </div>
        <Button variant="secondary" size="sm">
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
          Sync Now
        </Button>
      </div>
    </GlassCard>
  );
}
