"use client";

import type { FC } from "react";
import { ArrowUp, ArrowDown } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BadgeWithIcon } from "@/components/base/badges/badges";
import { ProgressBarCircle } from "@/components/base/progress-indicators/progress-circles";

interface MetricCardBaseProps {
  title: string;
  loading?: boolean;
  icon?: FC<{ className?: string }>;
  subtitle?: string;
}

interface MetricCardDefaultProps extends MetricCardBaseProps {
  value: number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  progress?: undefined;
}

interface MetricCardProgressProps extends MetricCardBaseProps {
  progress: {
    value: number;
    max: number;
    label?: string;
  };
  value?: undefined;
  change?: undefined;
  changeType?: undefined;
}

interface MetricCardSkeletonProps {
  title: string;
  loading: true;
  icon?: FC<{ className?: string }>;
  subtitle?: string;
  value?: number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
}

type MetricCardProps = MetricCardDefaultProps | MetricCardProgressProps | MetricCardSkeletonProps;

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

// Loading skeleton for the metric card
function MetricCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-tertiary" />
        <div className="size-10 rounded-lg bg-tertiary" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-8 w-20 rounded bg-tertiary" />
        <div className="h-5 w-16 rounded bg-tertiary" />
      </div>
    </div>
  );
}

export function MetricCard(props: MetricCardProps) {
  const { title, loading = false } = props;

  if (loading) {
    return <MetricCardSkeleton />;
  }

  // Progress variant: shows a circular progress indicator
  if (props.progress !== undefined) {
    const { progress, subtitle, icon } = props;
    const rate = progress.max > 0
      ? Math.round((progress.value / progress.max) * 100)
      : 0;

    return (
      <div className="flex flex-col rounded-xl border border-secondary bg-primary p-5 shadow-xs transition duration-100 ease-linear hover:shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-tertiary">{title}</p>
          {icon && (
            <FeaturedIcon
              icon={icon}
              color="brand"
              theme="light"
              size="sm"
            />
          )}
        </div>

        <div className="mt-3 flex items-center gap-4">
          <ProgressBarCircle
            value={progress.value}
            min={0}
            max={progress.max}
            size="xxs"
            label={progress.label}
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-display-sm font-semibold text-primary">
              {rate}%
            </p>
            {subtitle && (
              <p className="text-sm text-tertiary">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant: shows a large number
  const displayValue = props.value ?? 0;
  const change = props.change;
  const changeType = props.changeType ?? "neutral";
  const icon = props.icon;
  const subtitle = props.subtitle;

  const hasChange = change !== undefined && change !== null;
  const resolvedChangeType =
    changeType !== "neutral"
      ? changeType
      : change !== undefined && change > 0
        ? "increase"
        : change !== undefined && change < 0
          ? "decrease"
          : "neutral";

  return (
    <div className="flex flex-col rounded-xl border border-secondary bg-primary p-5 shadow-xs transition duration-100 ease-linear hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-tertiary">{title}</p>
        {icon && (
          <FeaturedIcon
            icon={icon}
            color="brand"
            theme="light"
            size="sm"
          />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <p className="text-display-sm font-semibold text-primary">
          {formatNumber(displayValue)}
        </p>

        {subtitle && !hasChange && (
          <p className="text-sm text-tertiary">{subtitle}</p>
        )}

        {hasChange && (
          <div className="flex items-center gap-2">
            <BadgeWithIcon
              type="pill-color"
              size="sm"
              color={
                resolvedChangeType === "increase"
                  ? "success"
                  : resolvedChangeType === "decrease"
                    ? "error"
                    : "gray"
              }
              iconLeading={
                resolvedChangeType === "increase"
                  ? ArrowUp
                  : resolvedChangeType === "decrease"
                    ? ArrowDown
                    : undefined
              }
            >
              {Math.abs(change).toFixed(1)}%
            </BadgeWithIcon>
            <span className="text-xs text-tertiary">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
