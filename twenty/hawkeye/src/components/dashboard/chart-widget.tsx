"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/application/charts/charts-base";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { BarChartSquare02 } from "@untitledui/icons";

type ChartType = "bar" | "line" | "pie" | "area";

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface ChartWidgetProps {
  title: string;
  description?: string;
  chartType: ChartType;
  data: ChartDataPoint[];
  loading?: boolean;
  error?: Error | null;
}

// Deterministic heights for skeleton bars (Fix 23)
const SKELETON_HEIGHTS = [55, 72, 40, 85, 60, 48, 78, 35];

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center animate-pulse">
      <div className="flex h-full w-full items-end gap-2 p-4">
        {SKELETON_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-tertiary"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-64 items-center justify-center">
      <EmptyState size="sm">
        <EmptyState.Header pattern="none">
          <EmptyState.FeaturedIcon
            icon={BarChartSquare02}
            color="gray"
            theme="modern"
          />
        </EmptyState.Header>
        <EmptyState.Content>
          <EmptyState.Title>No data available</EmptyState.Title>
          <EmptyState.Description>
            There is no data to display for this chart yet.
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState>
    </div>
  );
}

export function ChartWidget({
  title,
  description,
  chartType,
  data,
  loading = false,
  error = null,
}: ChartWidgetProps) {
  // Transform data for recharts: use 'name' key for category axis
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        name: d.label,
        value: d.value,
        fill: d.color,
        className: "", // for legend styling
      })),
    [data],
  );

  const renderChart = () => {
    if (loading) return <ChartSkeleton />;
    if (error) {
      return (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-error-primary">
            Failed to load: {error.message}
          </p>
        </div>
      );
    }
    if (chartData.length === 0) return <ChartEmpty />;

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border-tertiary"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs text-tertiary"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs text-tertiary"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border-tertiary"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs text-tertiary"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs text-tertiary"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="value"
                className="stroke-utility-brand-600"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Tooltip content={<ChartTooltipContent isPieChart />} />
              <Legend content={<ChartLegendContent />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="areaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-utility-brand-500)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-utility-brand-500)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border-tertiary"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs text-tertiary"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs text-tertiary"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="value"
                className="stroke-utility-brand-600"
                strokeWidth={2}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-secondary bg-primary shadow-xs">
      <div className="flex flex-col gap-1 border-b border-secondary px-5 py-4">
        <h3 className="text-md font-semibold text-primary">{title}</h3>
        {description && (
          <p className="text-sm text-tertiary">{description}</p>
        )}
      </div>
      <div className="p-4">{renderChart()}</div>
    </div>
  );
}
