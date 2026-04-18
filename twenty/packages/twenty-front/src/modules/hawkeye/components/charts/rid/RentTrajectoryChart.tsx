import { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getRidRentTrajectory } from '@/hawkeye/services/analytics.service';
import { type RentTrajectoryData } from '@/hawkeye/types/analytics.types';
import { formatINR, formatDate } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

type RentTrajectoryChartProps = {
  ridId: string;
};

const StyledSinglePoint = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  justify-content: center;
`;

const StyledSingleRent = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSingleMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const renderTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RentTrajectoryData }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.tenantName}</StyledTooltipLabel>
      <StyledTooltipRow>Rent: {formatINR(d.rent)}</StyledTooltipRow>
      <StyledTooltipRow>Start: {formatDate(d.contractStart)}</StyledTooltipRow>
      <StyledTooltipRow>Duration: {d.duration} months</StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const RentTrajectoryChart = ({ ridId }: RentTrajectoryChartProps) => {
  const colors = useChartColors();
  const [data, setData] = useState<RentTrajectoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getRidRentTrajectory(ridId)
      .then((result) => setData(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ridId]);

  const avgRent =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.rent, 0) / data.length)
      : 0;

  // Single data point: render a static display instead of a chart
  if (!loading && !error && data.length === 1) {
    const d = data[0];
    return (
      <ChartCard title="Rent Trajectory" loading={false} error={false} empty={false}>
        <StyledSinglePoint>
          <StyledSingleRent>{formatINR(d.rent)}</StyledSingleRent>
          <StyledSingleMeta>
            {d.tenantName} &middot; {formatDate(d.contractStart)} &middot;{' '}
            {d.duration} months
          </StyledSingleMeta>
        </StyledSinglePoint>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Rent Trajectory"
      subtitle="Rent across contracts"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            vertical={false}
            stroke={colors.gridStroke}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="contractStart"
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString('en-IN', {
                month: 'short',
                year: '2-digit',
              })
            }
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatINR(v)}
            tick={{ fill: colors.axisStroke, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={renderTooltip as any} />
          <ReferenceLine
            y={avgRent}
            stroke={colors.gray}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Line
            type="stepAfter"
            dataKey="rent"
            stroke={colors.blue}
            strokeWidth={2}
            dot={{ r: 5, fill: colors.blue, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: colors.blue, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
