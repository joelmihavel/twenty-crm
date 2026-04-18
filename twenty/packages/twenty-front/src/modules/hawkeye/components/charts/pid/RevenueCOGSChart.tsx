import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
  StyledTooltipDot,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getPidRevenueCogs } from '@/hawkeye/services/analytics.service';
import { type RevenueCOGSData } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

type RevenueCOGSChartProps = {
  pidId: string;
};

const formatLakh = (v: number) => '₹' + (v / 100000).toFixed(1) + 'L';

const renderTooltip = (
  colors: { green: string; red: string },
  {
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: RevenueCOGSData }>;
  },
) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const marginPct =
    d.revenue > 0 ? ((d.margin / d.revenue) * 100).toFixed(1) : '0';
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.month}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.green} />
        Revenue: {formatINR(d.revenue)}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.red} />
        COGS: {formatINR(d.cogs)}
      </StyledTooltipRow>
      <StyledTooltipRow>
        Margin: {formatINR(d.margin)} ({marginPct}%)
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const RevenueCOGSChart = ({ pidId }: RevenueCOGSChartProps) => {
  const colors = useChartColors();
  const [data, setData] = useState<RevenueCOGSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPidRevenueCogs(pidId)
      .then((result) => setData(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pidId]);

  return (
    <ChartCard
      title="Revenue vs COGS"
      subtitle="Monthly revenue and cost of goods sold"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.green} stopOpacity={0.25} />
              <stop offset="100%" stopColor={colors.green} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="cogsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.red} stopOpacity={0.25} />
              <stop offset="100%" stopColor={colors.red} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={colors.gridStroke}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="month"
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatLakh}
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={(props: any) =>
              renderTooltip(
                { green: colors.green, red: colors.red },
                props,
              )
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={colors.green}
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
          <Area
            type="monotone"
            dataKey="cogs"
            stroke={colors.red}
            strokeWidth={2}
            fill="url(#cogsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
