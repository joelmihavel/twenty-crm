import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
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
import { getPipelineBreakdown } from '@/hawkeye/services/analytics.service';
import { type StageBreakdownData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderTooltip = (
  total: number,
  {
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: StageBreakdownData }>;
  },
) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.stage}</StyledTooltipLabel>
      <StyledTooltipRow>
        <StyledTooltipDot color={d.color} />
        {d.count} leads ({pct}%)
      </StyledTooltipRow>
    </StyledTooltipWrapper>
  );
};

export const PipelineBreakdownChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<StageBreakdownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPipelineBreakdown()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  );

  return (
    <ChartCard
      title="Pipeline Breakdown"
      subtitle="Leads by lifecycle stage"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="stage"
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            label={false}
          >
            {data.map((entry) => (
              <Cell key={entry.stage} fill={entry.color} />
            ))}
          </Pie>
          <text
            x="50%"
            y="40%"
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.tooltipText}
            fontSize={20}
            fontWeight={600}
          >
            {total}
          </text>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.axisStroke}
            fontSize={11}
          >
            Active Leads
          </text>
          <Tooltip
            content={(props: any) => renderTooltip(total, props)}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ color: colors.legendText, fontSize: 12 }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
