import { useId } from 'react';

export interface WurdiMarkProps {
  size?: number;
  className?: string;
}

/**
 * WURDI's mark: an ascending three-point growth line inside a softly rounded
 * square, with a small terminal dot at the peak. Reads as "wealth trending up"
 * without being a literal coin or dollar sign — geometric and minimal enough to
 * hold up from a 20px sidebar icon to a large intro-screen centerpiece.
 * Pure SVG, no external assets, so it scales crisply at every size listed above.
 */
export function WurdiMark({ size = 20, className }: WurdiMarkProps) {
  // The responsive shell mounts this component multiple times at once (tablet
  // rail + desktop sidebar + mobile drawer, switched via CSS not unmounting) —
  // gradient ids must be unique per instance or every copy renders whichever
  // <defs> happens to appear first in the DOM.
  const uid = useId();
  const fillId = `wurdi-mark-fill-${uid}`;
  const strokeId = `wurdi-mark-stroke-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        fill={`url(#${fillId})`}
        stroke={`url(#${strokeId})`}
        strokeWidth="1"
      />
      <path
        d="M7 20.5L13 14.5L17.5 19L25 10.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="10.5" r="2" fill="currentColor" />
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#12b981" stopOpacity="0.16" />
          <stop offset="1" stopColor="#12b981" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={strokeId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6fcfae" stopOpacity="0.4" />
          <stop offset="1" stopColor="#6fcfae" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
