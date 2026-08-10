import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'positive' | 'negative' | 'neutral' | 'accent';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  positive: 'bg-primary/12 text-secondary border-primary/25',
  negative: 'bg-loss/12 text-loss border-loss/25',
  neutral: 'bg-white/[0.05] text-foreground-muted border-glass-border-strong',
  accent: 'bg-secondary/12 text-secondary border-secondary/25',
};

/** Small pill label used for trade sides, outcomes, and status indicators. */
export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
