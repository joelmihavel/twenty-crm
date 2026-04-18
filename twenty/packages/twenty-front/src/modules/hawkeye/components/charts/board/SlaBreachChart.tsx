import { useEffect, useState } from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getBoardSlaBreachRate } from '@/hawkeye/services/analytics.service';
import { type SlaBreachData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const StyledOverlay = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

const StyledRateText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 2px;
`;

const StyledSubLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: 4px;
`;

const getBreachColor = (rate: number, colors: ReturnType<typeof useChartColors>) => {
  if (rate <= 20) return colors.green;
  if (rate <= 50) return colors.orange;
  return colors.red;
};

export const SlaBreachChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<SlaBreachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getBoardSlaBreachRate()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const chartData = data
    ? [{ name: 'breach', value: data.rate, fill: getBreachColor(data.rate, colors) }]
    : [];

  return (
    <ChartCard
      title="SLA Breach Rate"
      height={120}
      loading={loading}
      error={error}
      empty={!loading && !error && !data}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <StyledOverlay>
          <StyledRateText>{data?.rate ?? 0}%</StyledRateText>
          <StyledLabel>SLA breach</StyledLabel>
          {data && (
            <StyledSubLabel>
              {data.breached} of {data.total} tickets
            </StyledSubLabel>
          )}
        </StyledOverlay>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            startAngle={90}
            endAngle={-270}
            data={chartData}
            barSize={10}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={5}
              background={{ fill: colors.gridStroke }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};
