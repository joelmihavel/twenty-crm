import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
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
import { getVisitConversionData } from '@/hawkeye/services/analytics.service';
import { type VisitConversionData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderTooltip = (
  colors: ReturnType<typeof useChartColors>,
  {
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: VisitConversionData }>;
  },
) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.month}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.sky} />
        Visits: {d.visits}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.green} />
        Conversions: {d.conversions}
      </StyledTooltipRow>
      <StyledTooltipRow>Rate: {d.rate}%</StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const VisitConversionChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<VisitConversionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVisitConversionData()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartCard
      title="Visit vs Conversion"
      subtitle="Monthly visits and converted leads"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
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
            yAxisId="left"
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={false}
            content={(props: any) => renderTooltip(colors, props)}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ color: colors.legendText, fontSize: 12 }}>
                {value}
              </span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="visits"
            name="Visits Completed"
            fill={colors.sky}
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversions"
            name="Converted"
            stroke={colors.green}
            strokeWidth={2}
            dot={{ r: 3, fill: colors.green, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: colors.green, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
