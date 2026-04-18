import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
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
import { getOverdueAging } from '@/hawkeye/services/analytics.service';
import { type OverdueAgingData } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

type TooltipPayloadEntry = {
  value: number;
  payload: OverdueAgingData;
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) => {
  if (!active || !payload?.length) return null;

  const entry = payload[0].payload;

  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{entry.bucket}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={entry.color} />
        Tenants: {entry.count}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={entry.color} />
        Outstanding: {formatINR(entry.totalAmount)}
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const OverdueAgingChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<OverdueAgingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOverdueAging()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartCard
      title="Overdue Aging"
      subtitle="Tenants grouped by days overdue"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, bottom: 0, left: 4 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="bucket"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry) => (
              <Cell key={entry.bucket} fill={entry.color} />
            ))}
            <LabelList
              dataKey="count"
              position="right"
              style={{ fontSize: 11, fill: colors.axisStroke }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
