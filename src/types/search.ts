export type SearchResultKind = 'nav' | 'trade' | 'asset' | 'goal';

export interface SearchResultItem {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  href: string;
}
