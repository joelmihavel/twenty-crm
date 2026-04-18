import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
  StyledTooltipDot,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getCollectionStatus } from '@/hawkeye/services/analytics.service';
import { type CollectionStatusData } from '@/hawkeye/types/analytics.types';
import { formatINR } from '@/hawkeye/utils/format';
/* eslint-disable @typescript-eslint/no-explicit-any */

const StyledCenterLabel = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;
`;

const StyledCenterCount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
`;

const StyledCenterCaption = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledPieWrapper = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

const STATUS_COLOR_MAP: Record<CollectionStatusData['status'], 'green' | 'red' | 'blue'> = {
  Paid: 'green',
  Overdue: 'red',
  Upcoming: 'blue',
};

type TooltipPayloadEntry = {
  value: number;
  payload: CollectionStatusData & { fill: string };
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
      <StyledTooltipLabel>{entry.status}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={entry.fill} />
        Count: {entry.count}
      </StyledTooltipRow>
      <StyledTooltipRow>
        <StyledTooltipDot color={entry.fill} />
        Amount: {formatINR(entry.amount)}
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const CollectionStatusChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<CollectionStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCollectionStatus()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const totalTenants = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard
      title="Collection Status"
      subtitle="Paid / Overdue / Upcoming tenants"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <StyledPieWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="status"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={colors[STATUS_COLOR_MAP[entry.status]]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <StyledCenterLabel>
          <StyledCenterCount>{totalTenants}</StyledCenterCount>
          <StyledCenterCaption>tenants</StyledCenterCaption>
        </StyledCenterLabel>
      </StyledPieWrapper>
    </ChartCard>
  );
};
