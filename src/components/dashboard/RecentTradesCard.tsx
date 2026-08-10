import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import type { Trade } from '@/types/portfolio';
import { formatCurrency, formatSignedCurrency } from '@/utils/format';

export interface RecentTradesCardProps {
  trades: Trade[];
}

function formatTradeTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${date.toLocaleTimeString(
    'en-US',
    { hour: 'numeric', minute: '2-digit' },
  )}`;
}

export function RecentTradesCard({ trades }: RecentTradesCardProps) {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-medium">Recent Trades</h3>
        <button className="text-foreground-subtle hover:text-secondary text-xs font-medium">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="border-glass-border rounded-2xl border bg-white/[0.015] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/12 text-secondary flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold">
                  {trade.assetSymbol.slice(0, 2)}
                </div>
                <span className="text-foreground text-sm font-medium">{trade.assetSymbol}</span>
              </div>
              <Badge tone={trade.side === 'Buy' ? 'positive' : 'negative'}>{trade.side}</Badge>
            </div>

            <p className="text-foreground-subtle mb-3 text-xs">
              {formatTradeTimestamp(trade.timestamp)}
            </p>

            <div className="mb-3 flex items-center justify-between text-sm">
              <div>
                <p className="text-foreground">{formatCurrency(trade.priceInUsd)}</p>
                <p className="text-foreground-subtle text-xs">Bought</p>
              </div>
              <div className="text-right">
                <p className="text-foreground">{formatCurrency(trade.priceOutUsd)}</p>
                <p className="text-foreground-subtle text-xs">Sold</p>
              </div>
            </div>

            <div className="border-glass-border flex items-center justify-between border-t pt-3">
              <span
                className={`text-sm font-medium ${
                  trade.outcome === 'Profit' ? 'text-secondary' : 'text-loss'
                }`}
              >
                {formatSignedCurrency(trade.pnlUsd)}
              </span>
              <Badge tone={trade.outcome === 'Profit' ? 'positive' : 'negative'}>
                {trade.outcome}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
