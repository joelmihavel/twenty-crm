"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Cube01 } from "@untitledui/icons";
import type { ObjectMetadata, RecordData, FieldMetadata } from "@/lib/twenty/types";
import { graphqlQuery } from "@/lib/twenty/graphql-client";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { getRecordTitle } from "@/lib/twenty/record-utils";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { cx } from "@/utils/cx";

interface ActivityItem {
  id: string;
  objectLabel: string;
  recordTitle: string;
  createdAt: string;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Loading skeleton
function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="size-8 shrink-0 rounded-full bg-tertiary" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-4 w-3/4 rounded bg-tertiary" />
            <div className="h-3 w-1/2 rounded bg-tertiary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityTimeline() {
  const { getNavigableObjects, loading: metadataLoading } = useMetadata();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecentActivity = useCallback(async () => {
    const objects = getNavigableObjects();
    if (objects.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the 3 most recently created records from each of the first 5 objects
      const objectSubset = objects.slice(0, 5);
      const results = await Promise.allSettled(
        objectSubset.map(async (obj: ObjectMetadata) => {
          const visibleFields = getVisibleFields(obj);
          const fieldNames = ["id", "createdAt"];

          // Include text-based fields for title extraction
          const titleFields = visibleFields
            .filter(
              (f: FieldMetadata) =>
                f.type === "TEXT" ||
                f.type === "FULL_NAME" ||
                f.type === "EMAILS",
            )
            .slice(0, 3);

          for (const f of titleFields) {
            if (f.type === "FULL_NAME") {
              fieldNames.push(`${f.name} { firstName lastName }`);
            } else if (f.type === "EMAILS") {
              fieldNames.push(`${f.name} { primaryEmail }`);
            } else {
              fieldNames.push(f.name);
            }
          }

          const query = `{
            ${obj.namePlural}(first: 3, orderBy: { createdAt: DescNullsFirst }) {
              edges {
                node {
                  ${fieldNames.join("\n                  ")}
                }
              }
            }
          }`;

          const data = await graphqlQuery<
            Record<
              string,
              { edges: { node: RecordData }[] }
            >
          >(query);

          const edges = data[obj.namePlural]?.edges ?? [];
          return edges.map((e) => ({
            id: `${obj.nameSingular}-${e.node.id}`,
            objectLabel: obj.labelSingular,
            recordTitle: getRecordTitle(e.node, visibleFields),
            createdAt: String(e.node.createdAt ?? ""),
          }));
        }),
      );

      const allActivities: ActivityItem[] = [];
      for (const result of results) {
        if (result.status === "fulfilled") {
          allActivities.push(...result.value);
        }
      }

      // Sort by createdAt descending, take top 10
      allActivities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setActivities(allActivities.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [getNavigableObjects]);

  useEffect(() => {
    if (metadataLoading) return;
    fetchRecentActivity();
  }, [metadataLoading, fetchRecentActivity]);

  return (
    <div className="flex flex-col rounded-xl border border-secondary bg-primary shadow-xs">
      <div className="flex items-center gap-2 border-b border-secondary px-5 py-4">
        <Clock className="size-5 text-fg-quaternary" />
        <h3 className="text-md font-semibold text-primary">
          Recent Activity
        </h3>
      </div>

      <div className="p-5">
        {loading ? (
          <TimelineSkeleton />
        ) : error ? (
          <p className="text-sm text-error-primary">
            Failed to load activity: {error.message}
          </p>
        ) : activities.length === 0 ? (
          <EmptyState size="sm">
            <EmptyState.Header pattern="none">
              <EmptyState.FeaturedIcon
                icon={Clock}
                color="gray"
                theme="modern"
              />
            </EmptyState.Header>
            <EmptyState.Content>
              <EmptyState.Title>No recent activity</EmptyState.Title>
              <EmptyState.Description>
                Activity will appear here once records are created.
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState>
        ) : (
          <div className="flex flex-col">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={cx(
                  "flex items-start gap-3 py-3",
                  index < activities.length - 1 &&
                    "border-b border-secondary",
                )}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-secondary">
                  <Cube01 className="size-4 text-fg-brand-primary" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium text-primary">
                    {activity.recordTitle}
                  </p>
                  <p className="text-xs text-tertiary">
                    {activity.objectLabel}
                    {activity.createdAt && (
                      <>
                        {" "}
                        &middot;{" "}
                        {formatTimeAgo(activity.createdAt)}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
