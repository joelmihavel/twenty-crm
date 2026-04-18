import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
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
import { getFsinUnitStates } from '@/hawkeye/services/analytics.service';
import { type UnitStateData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const StyledCenterLabel = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 45%;
  transform: translate(-50%, -50%);
`;

const StyledCenterCount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
`;

const StyledCenterState = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const renderTooltip = (totalCount: number) => {
  return ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: UnitStateData }>;
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = totalCount > 0 ? ((d.count / totalCount) * 100).toFixed(0) : '0';
    return (
      <StyledTooltipWrapper>
        <StyledTooltipLabel>{d.state}</StyledTooltipLabel>
        <StyledTooltipRow>
          <StyledTooltipDot color={d.color} />
          {d.count} units ({pct}%)
        </StyledTooltipRow>
      </StyledTooltipWrapper>
    );
  };
};

export const UnitStateChart = ({ fsinId }: { fsinId: string }) => {
  const [data, setData] = useState<UnitStateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getFsinUnitStates(fsinId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fsinId]);

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  const largest = useMemo(() => {
    if (data.length === 0) return { state: '', count: 0 };
    return data.reduce((max, d) => (d.count > max.count ? d : max), data[0]);
  }, [data]);

  return (
    <ChartCard
      title="Unit States"
      subtitle="Current state of all units"
      height={180}
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <StyledCenterLabel>
          <StyledCenterCount>{largest.count}</StyledCenterCount>
          <StyledCenterState>{largest.state}</StyledCenterState>
        </StyledCenterLabel>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="state"
              cx="50%"
              cy="45%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip(totalCount) as any} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};
