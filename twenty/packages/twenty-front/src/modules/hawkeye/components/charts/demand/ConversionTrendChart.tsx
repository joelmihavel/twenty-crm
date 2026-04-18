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
import { getConversionTrend } from '@/hawkeye/services/analytics.service';
import { type MonthlyConversionData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const GRADIENT_ID = 'conversionTrendGradient';

const renderTooltip = (
  colors: ReturnType<typeof useChartColors>,
  {
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: MonthlyConversionData }>;
  },
) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.month}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.blue} />
        Conversions: {d.conversions}
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const ConversionTrendChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<MonthlyConversionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getConversionTrend()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartCard
      title="Conversion Trend"
      subtitle="Monthly conversions — last 6 months"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={colors.blue}
                stopOpacity={0.2}
              />
              <stop
                offset="100%"
                stopColor={colors.blue}
                stopOpacity={0}
              />
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
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={false}
            content={(props: any) => renderTooltip(colors, props)}
          />
          <Area
            type="monotone"
            dataKey="conversions"
            stroke={colors.blue}
            strokeWidth={2}
            fill={`url(#${GRADIENT_ID})`}
            dot={{ r: 4, fill: colors.blue, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: colors.blue, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
