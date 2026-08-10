import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
}

/** Circular icon-only button, e.g. notifications bell, copy address, sync. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'border-glass-border-strong bg-glass text-foreground-muted inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200',
          'hover:text-foreground hover:border-secondary/30',
          'focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none',
          className,
        )}
        {...props}
      />
    );
  },
);
IconButton.displayName = 'IconButton';
