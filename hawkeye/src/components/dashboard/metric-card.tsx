"use client";

import type { FC } from "react";
import { ArrowUp, ArrowDown } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BadgeWithIcon } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: FC<{ className?: string }>;
  loading?: boolean;
}

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

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return <MetricCardSkeleton />;
  }

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
    <div className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary p-5 shadow-xs transition duration-100 ease-linear hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-tertiary">{title}</p>
        {icon && (
          <FeaturedIcon
            icon={icon}
            color="brand"
            theme="modern"
            size="sm"
          />
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <p className="text-display-xs font-semibold text-primary">
          {formatNumber(value)}
        </p>

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
