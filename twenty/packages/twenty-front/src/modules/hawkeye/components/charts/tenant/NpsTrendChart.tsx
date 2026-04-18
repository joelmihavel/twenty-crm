import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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
import { getTenantNpsTrend } from '@/hawkeye/services/analytics.service';
import { type NpsDataPoint } from '@/hawkeye/types/analytics.types';
import { formatDate } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

type NpsTrendChartProps = {
  tenantId: string;
};

const getScoreColor = (
  score: number,
  colors: { green: string; yellow: string; red: string },
): string => {
  if (score >= 9) return colors.green;
  if (score >= 7) return colors.yellow;
  return colors.red;
};

const renderTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: NpsDataPoint }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{formatDate(d.date)}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot
          color={
            d.score >= 9 ? '#10B981' : d.score >= 7 ? '#EAB308' : '#EF4444'
          }
        />
        Score: {d.score} &middot; {d.category}
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const NpsTrendChart = ({ tenantId }: NpsTrendChartProps) => {
  const colors = useChartColors();
  const [data, setData] = useState<NpsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTenantNpsTrend(tenantId)
      .then((result) => setData(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [tenantId]);

  const latestScore = data.length > 0 ? data[data.length - 1].score : 0;
  const strokeColor = getScoreColor(latestScore, colors);
  const hasEnoughData = data.length >= 2;

  return (
    <ChartCard
      title="NPS Trend"
      height={120}
      loading={loading}
      error={error}
      empty={!loading && !error && !hasEnoughData}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString('en-IN', {
                month: 'short',
                year: '2-digit',
              })
            }
            tick={{ fill: colors.axisStroke, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 5, 10]}
            tick={{ fill: colors.axisStroke, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip content={renderTooltip as any} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: strokeColor, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
