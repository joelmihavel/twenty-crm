import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
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
import { getVendorResolutionTime } from '@/hawkeye/services/analytics.service';
import { type ResolutionTimeData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderTooltip = (totalCount: number) => {
  return ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ResolutionTimeData }>;
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = totalCount > 0 ? ((d.count / totalCount) * 100).toFixed(0) : '0';
    return (
      <StyledTooltipWrapper>
        <StyledTooltipLabel>{d.bucket}</StyledTooltipLabel>
        <StyledTooltipRow>
          <StyledTooltipDot color={d.color} />
          {d.count} tickets ({pct}%)
        </StyledTooltipRow>
      </StyledTooltipWrapper>
    );
  };
};

export const ResolutionTimeChart = ({ vendorId }: { vendorId: string }) => {
  const colors = useChartColors();
  const [data, setData] = useState<ResolutionTimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVendorResolutionTime(vendorId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard
      title="Resolution Time"
      subtitle="Tickets by time to resolve"
      height={160}
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 30, bottom: 0, left: 0 }}
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
            width={70}
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={renderTooltip(totalCount) as any}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
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
