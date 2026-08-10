import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names safely, resolving conflicts (e.g. "p-2 p-4" -> "p-4").
 * Use this instead of template-string concatenation anywhere className is composed.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
