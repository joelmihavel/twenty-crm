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
  Dot,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
  StyledTooltipDot,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getItemRepairCost } from '@/hawkeye/services/analytics.service';
import { type RepairCostData } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

const PURCHASE_PRICE = 12000;
const REPLACE_THRESHOLD = PURCHASE_PRICE * 0.7;

const sizeColorMap: Record<string, string> = {
  small: '#EAB308',
  medium: '#F97316',
  large: '#EF4444',
};

const renderDot = (props: {
  cx?: number;
  cy?: number;
  payload?: RepairCostData;
}) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return <></>;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={sizeColorMap[payload.size] ?? '#F97316'}
      stroke="white"
      strokeWidth={2}
    />
  );
};

const renderTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RepairCostData }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.date}</StyledTooltipLabel>
      <StyledTooltipRow>{d.incident}</StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={sizeColorMap[d.size] ?? '#F97316'} />
        Cost: {formatINR(d.cost)}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color="transparent" />
        Cumulative: {formatINR(d.cumulative)}
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const RepairCostChart = ({ itemId }: { itemId: string }) => {
  const colors = useChartColors();
  const [data, setData] = useState<RepairCostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getItemRepairCost(itemId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [itemId]);

  return (
    <ChartCard
      title="Cumulative Repair Cost"
      subtitle="Repair spend over item lifetime"
      height={180}
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridStroke} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatINR(v)}
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            content={renderTooltip as any}
            cursor={{ stroke: colors.gridStroke }}
          />
          <ReferenceLine
            y={PURCHASE_PRICE}
            stroke={colors.gray}
            strokeDasharray="4 4"
            label={{
              value: `Purchase ${formatINR(PURCHASE_PRICE)}`,
              position: 'right',
              fill: colors.gray,
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={REPLACE_THRESHOLD}
            stroke={colors.red}
            strokeDasharray="4 4"
            label={{
              value: 'Replace threshold',
              position: 'right',
              fill: colors.red,
              fontSize: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={colors.orange}
            fill={colors.orange}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={renderDot}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
