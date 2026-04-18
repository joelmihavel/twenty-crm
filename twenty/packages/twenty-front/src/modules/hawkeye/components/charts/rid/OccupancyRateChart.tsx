import { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getRidOccupancyRate } from '@/hawkeye/services/analytics.service';
import { type OccupancyRateData } from '@/hawkeye/types/analytics.types';

type OccupancyRateChartProps = {
  ridId: string;
};

const StyledStatsRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledStatItem = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledStatValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledStatLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const getArcColor = (
  rate: number,
  colors: { green: string; yellow: string; red: string },
): string => {
  if (rate > 80) return colors.green;
  if (rate >= 50) return colors.yellow;
  return colors.red;
};

const renderCenterLabel = (
  rate: number,
  color: string,
  textColor: string,
  tertiaryColor: string,
) => {
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
    >
      <tspan
        x="50%"
        dy="-6"
        fill={color}
        fontSize="20"
        fontWeight="700"
      >
        {rate}%
      </tspan>
      <tspan
        x="50%"
        dy="18"
        fill={tertiaryColor}
        fontSize="11"
        fontWeight="400"
      >
        Occupancy
      </tspan>
    </text>
  );
};

export const OccupancyRateChart = ({ ridId }: OccupancyRateChartProps) => {
  const colors = useChartColors();
  const [data, setData] = useState<OccupancyRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getRidOccupancyRate(ridId)
      .then((result) => setData(result))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [ridId]);

  const arcColor = data ? getArcColor(data.rate, colors) : colors.green;

  // Background arc (full circle) + data arc
  const chartData = data
    ? [
        {
          name: 'occupancy',
          value: data.rate,
          fill: arcColor,
        },
      ]
    : [];

  return (
    <ChartCard
      title="Occupancy Rate"
      height={160}
      loading={loading}
      error={error}
      empty={!loading && !error && data === null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="60%"
              outerRadius="80%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
              barSize={10}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={5}
                background={{ fill: colors.gridStroke }}
              />
              {/* Center label */}
              <g>
                {data &&
                  renderCenterLabel(
                    data.rate,
                    arcColor,
                    colors.tooltipText,
                    colors.axisStroke,
                  )}
              </g>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        {data && (
          <StyledStatsRow>
            <StyledStatItem>
              <StyledStatValue>{data.occupiedMonths}</StyledStatValue>
              <StyledStatLabel>Occupied</StyledStatLabel>
            </StyledStatItem>
            <StyledStatItem>
              <StyledStatValue>{data.vacantMonths}</StyledStatValue>
              <StyledStatLabel>Vacant</StyledStatLabel>
            </StyledStatItem>
            <StyledStatItem>
              <StyledStatValue>{data.maintenanceMonths}</StyledStatValue>
              <StyledStatLabel>Maintenance</StyledStatLabel>
            </StyledStatItem>
          </StyledStatsRow>
        )}
      </div>
    </ChartCard>
  );
};
