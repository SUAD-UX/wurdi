'use client';

import { useId } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { PerformancePoint } from '@/types/portfolio';
import { formatCurrency } from '@/utils/format';

export interface PerformanceAreaChartProps {
  data: PerformancePoint[];
  /** Show axis labels and gridlines (full chart vs. minimal hero backdrop) */
  detailed?: boolean;
  height?: number;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: PerformancePoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="border-glass-border-strong bg-background-elevated/95 rounded-xl border px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="text-foreground-subtle mb-0.5">{point.date}</p>
      <p className="text-foreground font-semibold">{formatCurrency(point.valueUsd)}</p>
    </div>
  );
}

export function PerformanceAreaChart({
  data,
  detailed = false,
  height = 240,
}: PerformanceAreaChartProps) {
  const gradientId = `performance-gradient-${useId()}`;

  if (data.length === 0) {
    return (
      <div
        role="status"
        className="text-foreground-subtle flex items-center justify-center text-sm"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  // Without an explicit domain, Recharts' Area fills from the line down to y=0 by
  // default — since portfolio values are ~$11-13K, that fills almost the entire
  // chart height with solid green ("giant solid block", not a sparkline). Padding
  // the domain to just outside the data's own min/max keeps the fill hugging the
  // curve instead.
  const values = data.map((point) => point.valueUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.35 || max * 0.05;
  const domain: [number, number] = [min - padding, max + padding];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: detailed ? 12 : 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-emerald-primary)" stopOpacity={0.1} />
            <stop offset="100%" stopColor="var(--color-emerald-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {detailed && <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />}
        {detailed && (
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground-subtle)', fontSize: 12 }}
            dy={10}
          />
        )}
        <YAxis
          hide={!detailed}
          domain={domain}
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'var(--foreground-subtle)', fontSize: 12 }}
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
          width={detailed ? 44 : 0}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(127,232,196,0.2)' }} />
        <Area
          type="monotone"
          dataKey="valueUsd"
          stroke="var(--color-emerald-primary)"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
