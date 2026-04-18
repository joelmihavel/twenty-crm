import { useEffect, useState } from 'react';
import {
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { ChartCard } from '@/hawkeye/components/charts/ChartCard';
import {
  StyledTooltipWrapper,
  StyledTooltipLabel,
  StyledTooltipRow,
} from '@/hawkeye/components/charts/ChartTooltip';
import { useChartColors } from '@/hawkeye/components/charts/useChartColors';
import { getDemandFunnel } from '@/hawkeye/services/analytics.service';
import { type FunnelStageData } from '@/hawkeye/types/analytics.types';
/* eslint-disable @typescript-eslint/no-explicit-any */

const renderTooltip = ({
  active,
  payload,
  funnelData,
}: {
  active?: boolean;
  payload?: Array<{ payload: FunnelStageData }>;
  funnelData: FunnelStageData[];
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const idx = funnelData.findIndex((s) => s.stage === d.stage);
  const prev = idx > 0 ? funnelData[idx - 1] : null;
  const dropOff = prev
    ? Math.round(((prev.count - d.count) / prev.count) * 100)
    : 0;

  return (
    <StyledTooltipWrapper>
      <StyledTooltipLabel>{d.stage}</StyledTooltipLabel>
      <StyledTooltipRow>Count: {d.count}</StyledTooltipRow>
      {prev && (
        <StyledTooltipRow>Drop-off: {dropOff}% from previous</StyledTooltipRow>
      )}
    </StyledTooltipWrapper>
  );
};

export const ConversionFunnelChart = () => {
  const colors = useChartColors();
  const [data, setData] = useState<FunnelStageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getDemandFunnel()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChartCard
      title="Conversion Funnel"
      subtitle="Tenant acquisition stages"
      loading={loading}
      error={error}
      empty={!loading && !error && data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip
            content={(props: any) =>
              renderTooltip({
                active: props.active,
                payload: props.payload,
                funnelData: data,
              })
            }
          />
          <Funnel dataKey="count" data={data} isAnimationActive>
            <LabelList
              position="right"
              fill={colors.axisStroke}
              fontSize={12}
              dataKey="stage"
            />
            {data.map((entry, index) => (
              <Cell
                key={entry.stage}
                fill={
                  index === data.length - 1 ? colors.green : colors.blue
                }
              />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
