import type { LucideIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Used by routes that exist (nav works, no more 404) but have no real feature built yet. */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="text-secondary h-5 w-5" strokeWidth={1.75} />
      </div>
      <h2 className="text-foreground text-base font-medium">{title}</h2>
      <p className="text-foreground-subtle max-w-xs text-sm">{description}</p>
    </GlassCard>
  );
}
