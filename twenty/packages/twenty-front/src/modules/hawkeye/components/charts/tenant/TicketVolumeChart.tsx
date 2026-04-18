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
import { getTenantTicketVolume } from '@/hawkeye/services/analytics.service';
import { type MonthlyTicketData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

type TicketVolumeChartProps = {
  tenantId: string;
};

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
      <StyledTooltipRow>
        {d.count} {d.count === 1 ? 'ticket' : 'tickets'}
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const TicketVolumeChart = ({ tenantId }: TicketVolumeChartProps) => {
  const colors = useChartColors();
  const [data, setData] = useState<MonthlyTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTenantTicketVolume(tenantId)
      .then((result) => setData(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [tenantId]);

  const allZero =
    !loading && !error && data.length > 0 && data.every((d) => d.count === 0);

  return (
    <ChartCard
      title="Ticket Volume"
      height={120}
      loading={loading}
      error={error}
      empty={(!loading && !error && data.length === 0) || allZero}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            vertical={false}
            stroke={colors.gridStroke}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="month"
            tick={{ fill: colors.axisStroke, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
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
