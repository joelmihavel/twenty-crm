import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
  StyledTooltipDot,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getFsinProcurementHistory } from '@/hawkeye/services/analytics.service';
import { type ProcurementData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderLabel = (props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}) => {
  const { x, y, width, value } = props;
  if (!value || value === 0) return null;
  return (
    <text
      x={(x ?? 0) + (width ?? 0) / 2}
      y={(y ?? 0) - 4}
      fill="#6B7280"
      textAnchor="middle"
      fontSize={10}
    >
      {value}
    </text>
  );
};

const renderTooltip = (colors: ReturnType<typeof useChartColors>) => {
  return ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ProcurementData }>;
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <StyledTooltipWrapper>
        <StyledTooltipLabel>{d.month}</StyledTooltipLabel>
        <StyledTooltipRow>
          <StyledTooltipDot color={colors.blue} />
          Units purchased: {d.units}
        </StyledTooltipRow>
        <StyledTooltipRow>
          <StyledTooltipDot color={colors.gray} />
          Cumulative total: {d.cumulative}
        </StyledTooltipRow>
      </StyledTooltipWrapper>
    );
  };
};

export const ProcurementHistoryChart = ({
  fsinId,
}: {
  fsinId: string;
}) => {
  const colors = useChartColors();
  const [data, setData] = useState<ProcurementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getFsinProcurementHistory(fsinId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fsinId]);

  return (
    <ChartCard
      title="Procurement History"
      subtitle="Monthly purchases and running total"
      height={160}
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 16, right: 12, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
            width={30}
            label={{
              value: 'Units',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 10, fill: colors.axisStroke },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
            width={30}
            label={{
              value: 'Total',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 10, fill: colors.axisStroke },
            }}
          />
          <Tooltip content={renderTooltip(colors) as any} />
          <Bar
            yAxisId="left"
            dataKey="units"
            fill={colors.blue}
            radius={[4, 4, 0, 0]}
          >
            <LabelList dataKey="units" content={renderLabel as any} />
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke={colors.gray}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
