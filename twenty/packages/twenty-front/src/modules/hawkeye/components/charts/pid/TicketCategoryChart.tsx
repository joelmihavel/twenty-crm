import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getPidTicketCategories } from '@/hawkeye/services/analytics.service';
import { type TicketCategoryData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

type TicketCategoryChartProps = {
  pidId: string;
};

const renderTooltip = (
  total: number,
  {
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: TicketCategoryData }>;
  },
) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : '0';
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.category}</StyledTooltipLabel>
      <StyledTooltipRow>
        {d.count} {d.count === 1 ? 'ticket' : 'tickets'} ({pct}%)
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const TicketCategoryChart = ({ pidId }: TicketCategoryChartProps) => {
  const colors = useChartColors();
  const [data, setData] = useState<TicketCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPidTicketCategories(pidId)
      .then((result) => setData(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pidId]);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 0);

  return (
    <ChartCard
      title="Tickets by Category"
      height={180}
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            vertical={false}
            stroke={colors.gridStroke}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="category"
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={(props: any) =>
              renderTooltip(total, props)
            }
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors.blue}
                fillOpacity={entry.count === maxCount ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
