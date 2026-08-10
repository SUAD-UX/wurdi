import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-black hover:bg-primary-dim shadow-[0_12px_28px_-10px_rgba(18,185,129,0.45)] hover:shadow-[0_16px_34px_-8px_rgba(18,185,129,0.55)]',
  secondary:
    'bg-glass-strong text-foreground border border-glass-border-strong hover:border-secondary/35 hover:bg-white/[0.07]',
  ghost: 'text-foreground-muted hover:text-foreground hover:bg-white/[0.05]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-full',
  md: 'h-10 px-4 text-sm gap-2 rounded-full',
  lg: 'h-12 px-6 text-base gap-2 rounded-full',
};

/**
 * Standard interactive button. Rounded-full to match the pill/blob visual
 * language established by the dashboard mockup.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-[var(--duration-liquid)] ease-[var(--ease-liquid)]',
          'focus-visible:ring-primary/60 focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-40',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
