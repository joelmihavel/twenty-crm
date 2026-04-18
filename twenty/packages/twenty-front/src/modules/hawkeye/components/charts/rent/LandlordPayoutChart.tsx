import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
import { getLandlordPayoutByCluster } from '@/hawkeye/services/analytics.service';
import { type LandlordPayoutData } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

const formatLakh = (v: number) => '₹' + (v / 100000).toFixed(1) + 'L';

type TooltipPayloadEntry = {
  value: number;
  dataKey: string;
  payload: LandlordPayoutData;
};

const CustomTooltip = ({
  active,
  payload,
  colors,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  colors: ReturnType<typeof useChartColors>;
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{data.cluster}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.green} />
        Paid: {formatINR(data.paid)}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.yellow} />
        Pending: {formatINR(data.pending)}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={colors.red} />
        Overdue: {formatINR(data.overdue)}
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const LandlordPayoutChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<LandlordPayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getLandlordPayoutByCluster()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartCard
      title="Landlord Payout by Cluster"
      subtitle="Paid / Pending / Overdue per PID cluster"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 0, left: 4 }}
        >
          <XAxis
            type="number"
            tickFormatter={formatLakh}
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="cluster"
            tick={{ fontSize: 11, fill: colors.axisStroke }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            content={<CustomTooltip colors={colors} />}
            cursor={{ fill: 'transparent' }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: colors.legendText }}
          />
          <Bar
            dataKey="paid"
            stackId="payout"
            fill={colors.green}
            name="Paid"
            radius={[0, 0, 0, 0]}
            barSize={18}
          />
          <Bar
            dataKey="pending"
            stackId="payout"
            fill={colors.yellow}
            name="Pending"
            radius={[0, 0, 0, 0]}
            barSize={18}
          />
          <Bar
            dataKey="overdue"
            stackId="payout"
            fill={colors.red}
            name="Overdue"
            radius={[0, 4, 4, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
