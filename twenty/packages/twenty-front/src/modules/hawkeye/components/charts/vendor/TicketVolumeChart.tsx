import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
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
import { getVendorTicketVolume } from '@/hawkeye/services/analytics.service';
import { type MonthlyTicketData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyTicketData }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.month}</StyledTooltipLabel>
      <StyledTooltipRow>{d.count} tickets</StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const TicketVolumeChart = ({ vendorId }: { vendorId: string }) => {
  const colors = useChartColors();
  const [data, setData] = useState<MonthlyTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVendorTicketVolume(vendorId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [vendorId]);

  return (
    <ChartCard
      title="Ticket Volume"
      subtitle="Tickets per month"
      height={140}
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
        >
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={renderTooltip as any}
          />
          <Bar
            dataKey="count"
            fill={colors.blue}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
