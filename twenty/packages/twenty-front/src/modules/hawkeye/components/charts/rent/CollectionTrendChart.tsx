import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
  StyledTooltipDot,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getCollectionTrend } from '@/hawkeye/services/analytics.service';
import { type MonthlyCollectionData } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

const formatLakh = (v: number) => '₹' + (v / 100000).toFixed(1) + 'L';

type TooltipPayloadEntry = {
  value: number;
  dataKey: string;
  payload: MonthlyCollectionData;
};

const CustomTooltip = ({
  active,
  payload,
  colors,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  colors: ReturnType<typeof useChartColors>;
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const pct =
    data.target > 0 ? ((data.collected / data.target) * 100).toFixed(1) : '—';

  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{data.month}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.green} />
        Collected: {formatINR(data.collected)}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.gray} />
        Target: {formatINR(data.target)}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color="transparent" />
        {pct}% of target
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const CollectionTrendChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<MonthlyCollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCollectionTrend()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartCard
      title="Collection Trend"
      subtitle="Rent collected vs target — last 6 months"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatLakh}
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip colors={colors} />}
            cursor={{ stroke: colors.gridStroke }}
          />
          <ReferenceLine
            x="Apr"
            stroke={colors.axisStroke}
            strokeDasharray="4 4"
            label={{
              value: 'Current',
              position: 'top',
              fill: colors.axisStroke,
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke={colors.gray}
            strokeDasharray="5 3"
            fill="none"
            strokeWidth={1.5}
            dot={false}
            name="Target"
          />
          <Area
            type="monotone"
            dataKey="collected"
            stroke={colors.green}
            fill={colors.green}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={false}
            name="Collected"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
