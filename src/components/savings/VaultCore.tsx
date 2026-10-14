import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface VaultCoreProps {
  pulse?: boolean;
}

export function VaultCore({ pulse = false }: VaultCoreProps) {
  const glowId = `vault-core-glow-${useId()}`;
  const coreId = `vault-core-fill-${useId()}`;

  return (
    <div
      className={cn('vault-core h-20 w-20 shrink-0', pulse && 'vault-core--pulse')}
      aria-hidden="true"
    >
      <svg viewBox="0 0 80 80" fill="none" className="h-full w-full">
        <defs>
          <radialGradient id={glowId}>
            <stop stopColor="#6EE7B7" stopOpacity="0.52" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={coreId} cx="35%" cy="30%">
            <stop stopColor="#A7F3D0" />
            <stop offset="1" stopColor="#10B981" />
          </radialGradient>
        </defs>
        <ellipse
          className="vault-core__ring vault-core__ring--outer"
          cx="40"
          cy="40"
          rx="34"
          ry="15"
        />
        <ellipse
          className="vault-core__ring vault-core__ring--middle"
          cx="40"
          cy="40"
          rx="24"
          ry="32"
        />
        <ellipse
          className="vault-core__ring vault-core__ring--inner"
          cx="40"
          cy="40"
          rx="19"
          ry="9"
        />
        <circle className="vault-core__glow" cx="40" cy="40" r="19" fill={`url(#${glowId})`} />
        <circle className="vault-core__core" cx="40" cy="40" r="10" fill={`url(#${coreId})`} />
      </svg>
    </div>
  );
}
