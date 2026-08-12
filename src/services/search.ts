import { NAV_ITEMS } from '@/constants/navigation';
import { MOCK_TRADES } from '@/constants/mock-dashboard';
import type { SearchResultItem } from '@/types/search';

/**
 * STUB search implementation — searches local mock data (sidebar destinations +
 * recent trades) synchronously, wrapped in a Promise so every caller already
 * treats this as async. When real portfolio/trade/goal data and a backend exist,
 * only this function's body changes (e.g. to an API call) — SearchPalette and
 * every other caller stays exactly the same, since they only depend on
 * `SearchResultItem[]`.
 */
export async function searchWurdi(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const navResults: SearchResultItem[] = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(trimmed),
  ).map((item) => ({
    id: `nav-${item.href}`,
    kind: 'nav',
    title: item.label,
    subtitle: 'Go to page',
    href: item.href,
  }));

  const tradeResults: SearchResultItem[] = MOCK_TRADES.filter(
    (trade) =>
      trade.assetSymbol.toLowerCase().includes(trimmed) ||
      trade.assetName.toLowerCase().includes(trimmed),
  ).map((trade) => ({
    id: `trade-${trade.id}`,
    kind: 'trade',
    title: `${trade.assetSymbol} — ${trade.side}`,
    subtitle: trade.assetName,
    href: '/trades',
  }));

  return [...navResults, ...tradeResults];
}
