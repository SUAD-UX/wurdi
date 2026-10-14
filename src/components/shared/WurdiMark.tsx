import { useId } from 'react';

export interface WurdiMarkProps {
  size?: number;
  className?: string;
}

/** WURDI's gradient W mark, shared by the navigation and intro screen. */
export function WurdiMark({ size = 20, className }: WurdiMarkProps) {
  const gradientId = `wurdi-mark-gradient-${useId()}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.35))' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6EE7B7" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path
        d="M6 10 L15 38 L24 18 L33 38 L42 10"
        stroke={`url(#${gradientId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="10" r="3" fill="#6EE7B7" />
    </svg>
  );
}
