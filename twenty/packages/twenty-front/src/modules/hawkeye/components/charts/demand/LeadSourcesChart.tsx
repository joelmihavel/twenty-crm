import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
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
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getLeadSources } from '@/hawkeye/services/analytics.service';
import { type LeadSourceData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: LeadSourceData }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.channel}</StyledTooltipLabel>
      <StyledTooltipRow>
        {d.count} leads ({d.percentage}%)
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const LeadSourcesChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<LeadSourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getLeadSources()
      .then((result) => {
        setData(result.sort((a, b) => b.count - a.count));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartCard
      title="Lead Sources"
      subtitle="Leads by acquisition channel"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data}>
          <CartesianGrid
            horizontal={false}
            stroke={colors.gridStroke}
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="channel"
            width={110}
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={renderTooltip as any}
          />
          <Bar dataKey="count" fill={colors.blue} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
