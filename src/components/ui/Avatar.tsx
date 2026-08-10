import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  className?: string;
}

/** Circular avatar with initials fallback when no image is provided. */
export function Avatar({ name, imageUrl, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user avatars are remote/arbitrary URLs, not build-time assets
      <img
        src={imageUrl}
        alt={name}
        className={cn('h-9 w-9 rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'bg-primary/15 text-secondary flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
        className,
      )}
    >
      {initials}
    </div>
  );
}
