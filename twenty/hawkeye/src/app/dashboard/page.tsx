"use client";

import { useState } from "react";
import {
  RefreshCw01,
  Key01,
  Users01,
  File06,
  Truck01,
} from "@untitledui/icons";
import type { DateValue, RangeValue } from "react-aria-components";
import { DateRangePicker } from "@/components/application/date-picker/date-range-picker";
import { Button } from "@/components/base/buttons/button";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartWidget } from "@/components/dashboard/chart-widget";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { DashboardErrorBoundary } from "@/components/dashboard/error-boundary";
import { useDashboardKPIs } from "@/lib/hooks/use-dashboard-kpis";
import { useAggregateData } from "@/lib/hooks/use-aggregate-data";

export default function DashboardPage() {
  const { data: kpis, loading: kpisLoading, refetch } = useDashboardKPIs();
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-xs font-semibold text-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-tertiary">
            Property management overview and key performance indicators.
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

      {/* Row 1 — KPI Cards */}
      <DashboardErrorBoundary fallbackTitle="Failed to load metrics">
        <section
          aria-label="Key performance indicators"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {kpisLoading ? (
            <>
              <MetricCard title="" loading />
              <MetricCard title="" loading />
              <MetricCard title="" loading />
              <MetricCard title="" loading />
            </>
          ) : (
            <>
              <MetricCard
                title="Occupancy Rate"
                icon={Key01}
                progress={{
                  value: kpis?.occupancy.occupied ?? 0,
                  max: kpis?.occupancy.total ?? 1,
                }}
                subtitle={`${kpis?.occupancy.occupied ?? 0} / ${kpis?.occupancy.total ?? 0} rooms`}
              />
              <MetricCard
                title="Active Tenants"
                icon={Users01}
                value={kpis?.activeTenants ?? 0}
                subtitle={`of ${kpis?.totalTenants?.toLocaleString() ?? "0"} total`}
              />
              <MetricCard
                title="Contracts"
                icon={File06}
                value={kpis?.contracts ?? 0}
                subtitle="Active contracts"
              />
              <MetricCard
                title="Vendors"
                icon={Truck01}
                value={kpis?.vendors ?? 0}
                subtitle="Registered vendors"
              />
            </>
          )}
        </section>
      </DashboardErrorBoundary>

      {/* Row 2 — Tenant Pipeline + Properties by Cluster */}
      <section
        aria-label="Pipeline and distribution charts"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <DashboardErrorBoundary fallbackTitle="Failed to load Tenant Pipeline">
          <TenantPipelineChart />
        </DashboardErrorBoundary>
        <DashboardErrorBoundary fallbackTitle="Failed to load Properties by Cluster">
          <PropertiesByClusterChart />
        </DashboardErrorBoundary>
      </section>

      {/* Row 3 — Room Status + Vendor Types */}
      <section
        aria-label="Status and type distribution charts"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <DashboardErrorBoundary fallbackTitle="Failed to load Room Status">
          <RoomStatusChart />
        </DashboardErrorBoundary>
        <DashboardErrorBoundary fallbackTitle="Failed to load Vendor Types">
          <VendorTypesChart />
        </DashboardErrorBoundary>
      </section>

      {/* Row 4 — Activity Timeline */}
      <DashboardErrorBoundary fallbackTitle="Failed to load activity">
        <ActivityTimeline />
      </DashboardErrorBoundary>
    </div>
  );
}

// -------------------------------------------------------------------
// Chart wrapper components (one per chart to keep hook rules valid)
// -------------------------------------------------------------------

function TenantPipelineChart() {
  const { data, loading, error } = useAggregateData(
    "tenant",
    "tenantLifecycle",
  );

  // Replace "(empty)" labels with "Unassigned"
  const normalizedData = data.map((d) => ({
    ...d,
    label: d.label === "(empty)" ? "Unassigned" : d.label,
  }));

  return (
    <ChartWidget
      title="Tenant Pipeline"
      description="Tenants grouped by lifecycle stage"
      chartType="bar"
      data={normalizedData}
      loading={loading}
      error={error}
    />
  );
}

function PropertiesByClusterChart() {
  const { data, loading, error } = useAggregateData("property", "cluster");

  const normalizedData = data.map((d) => ({
    ...d,
    label: d.label === "(empty)" ? "Unassigned" : d.label,
  }));

  return (
    <ChartWidget
      title="Properties by Cluster"
      description="Distribution of properties across geographic clusters"
      chartType="bar"
      data={normalizedData}
      loading={loading}
      error={error}
    />
  );
}

function RoomStatusChart() {
  const { data, loading, error } = useAggregateData(
    "roomAvailability",
    "roomStatus",
  );

  const normalizedData = data.map((d) => ({
    ...d,
    label: d.label === "(empty)" ? "Unassigned" : d.label,
  }));

  return (
    <ChartWidget
      title="Room Status"
      description="Room availability breakdown by status"
      chartType="pie"
      data={normalizedData}
      loading={loading}
      error={error}
    />
  );
}

function VendorTypesChart() {
  const { data, loading, error } = useAggregateData("vendor", "vendorType");

  const normalizedData = data.map((d) => ({
    ...d,
    label: d.label === "(empty)" ? "Unassigned" : d.label,
  }));

  return (
    <ChartWidget
      title="Vendor Types"
      description="Vendors grouped by service type"
      chartType="bar"
      data={normalizedData}
      loading={loading}
      error={error}
    />
  );
}
