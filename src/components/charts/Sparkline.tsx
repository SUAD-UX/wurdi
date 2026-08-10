'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export interface SparklinePoint {
  value: number;
}

export interface SparklineProps {
  data: SparklinePoint[];
  positive?: boolean;
}

/** Minimal trend sparkline with no axes, used inside compact metric cards. */
export function Sparkline({ data, positive = true }: SparklineProps) {
  const color = positive ? 'var(--color-emerald-primary)' : 'var(--color-loss)';
  const gradientId = positive ? 'sparkline-positive' : 'sparkline-negative';

  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
