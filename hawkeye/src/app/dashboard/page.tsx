"use client";

import { useMemo, useState } from "react";
import {
  RefreshCw01,
} from "@untitledui/icons";
import type { FC } from "react";
import type { DateValue, RangeValue } from "react-aria-components";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { Button } from "@/components/base/buttons/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartWidget } from "@/components/dashboard/chart-widget";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { DashboardErrorBoundary } from "@/components/dashboard/error-boundary";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import { useAggregateData } from "@/lib/hooks/use-aggregate-data";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { OBJECT_ICON_MAP, Cube01 } from "@/lib/twenty/object-icons";

function getStatIcon(name: string): FC<{ className?: string }> {
  return OBJECT_ICON_MAP[name] ?? Cube01;
}

export default function DashboardPage() {
  const { objectStats, loading: statsLoading, refetch } = useDashboardStats();
  const { getNavigableObjects, loading: metadataLoading } = useMetadata();
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null,
  );

  // Determine chart data sources from navigable objects
  const chartConfig = useMemo(() => {
    const objects = getNavigableObjects();
    const configs: {
      objectName: string;
      fieldName: string;
      title: string;
      description: string;
      chartType: "bar" | "line" | "pie" | "area";
    }[] = [];

    for (const obj of objects) {
      // Find a SELECT field for distribution charts
      const selectField = obj.fields.find((f) => f.type === "SELECT");
      if (selectField) {
        configs.push({
          objectName: obj.nameSingular,
          fieldName: selectField.name,
          title: `${obj.labelPlural} by ${selectField.label}`,
          description: `Distribution of ${obj.labelPlural.toLowerCase()} across ${selectField.label.toLowerCase()} values`,
          chartType: configs.length % 2 === 0 ? "bar" : "pie",
        });
      }

      if (configs.length >= 4) break;

      // Find a TEXT field for grouping (e.g., city, source)
      const textField = obj.fields.find(
        (f) =>
          f.type === "TEXT" &&
          f.name !== "name" &&
          f.name !== "title" &&
          !f.name.includes("Id"),
      );
      if (textField && configs.length < 4) {
        configs.push({
          objectName: obj.nameSingular,
          fieldName: textField.name,
          title: `${obj.labelPlural} by ${textField.label}`,
          description: `Top ${textField.label.toLowerCase()} values for ${obj.labelPlural.toLowerCase()}`,
          chartType: configs.length % 2 === 0 ? "area" : "line",
        });
      }

      if (configs.length >= 4) break;
    }

    return configs;
  }, [getNavigableObjects]);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-tertiary">
            Overview of your CRM analytics and key metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            size="sm"
          />
          <Button
            size="sm"
            color="secondary"
            iconLeading={RefreshCw01}
            onClick={refetch}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <DashboardErrorBoundary fallbackTitle="Failed to load metrics">
        <section
          aria-label="Key metrics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <MetricCard
                  key={i}
                  title=""
                  value={0}
                  loading
                />
              ))
            : objectStats.slice(0, 8).map((stat) => (
                <MetricCard
                  key={stat.name}
                  title={stat.label}
                  value={stat.count}
                  icon={getStatIcon(stat.name)}
                />
              ))}
        </section>
      </DashboardErrorBoundary>

      {/* Charts Grid */}
      <section
        aria-label="Charts"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {chartConfig.map((config) => (
          <DashboardErrorBoundary
            key={`${config.objectName}-${config.fieldName}`}
            fallbackTitle={`Failed to load ${config.title}`}
          >
            <ChartWidgetConnected
              objectName={config.objectName}
              fieldName={config.fieldName}
              title={config.title}
              description={config.description}
              chartType={config.chartType}
            />
          </DashboardErrorBoundary>
        ))}
      </section>

      {/* Activity Timeline */}
      <DashboardErrorBoundary fallbackTitle="Failed to load activity">
        <ActivityTimeline />
      </DashboardErrorBoundary>
    </div>
  );
}

// Separate component to keep hook rules valid (one hook call per chart)
function ChartWidgetConnected({
  objectName,
  fieldName,
  title,
  description,
  chartType,
}: {
  objectName: string;
  fieldName: string;
  title: string;
  description: string;
  chartType: "bar" | "line" | "pie" | "area";
}) {
  const { data, loading, error } = useAggregateData(objectName, fieldName);

  return (
    <ChartWidget
      title={title}
      description={description}
      chartType={chartType}
      data={data}
      loading={loading}
      error={error}
    />
  );
}
