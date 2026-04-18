import { useEffect, useState } from 'react';
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
import { getVendorCategoryBreakdown } from '@/hawkeye/services/analytics.service';
import { type CategoryData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderTooltip = (totalCount: number) => {
  return ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: CategoryData & { fill: string } }>;
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = totalCount > 0 ? ((d.count / totalCount) * 100).toFixed(0) : '0';
    return (
      <StyledTooltipWrapper>
        <StyledTooltipLabel>{d.category}</StyledTooltipLabel>
        <StyledTooltipRow>
          <StyledTooltipDot color={payload[0].payload.fill} />
          {d.count} tickets ({pct}%)
        </StyledTooltipRow>
      </StyledTooltipWrapper>
    );
  };
};

export const CategoryBreakdownChart = ({
  vendorId,
}: {
  vendorId: string;
}) => {
  const colors = useChartColors();
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVendorCategoryBreakdown(vendorId)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const pieColors = [colors.blue, colors.sky, colors.orange, colors.purple, colors.gray];

  return (
    <ChartCard
      title="Category Breakdown"
      subtitle="Tickets by category"
      height={160}
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="45%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
          >
            {data.map((_entry, index) => (
              <Cell
                key={index}
                fill={pieColors[index % pieColors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip(totalCount) as any} />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: 11, color: colors.legendText }}
            iconSize={8}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
