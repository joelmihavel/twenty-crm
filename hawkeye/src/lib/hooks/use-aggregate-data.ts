"use client";

import { useCallback, useEffect, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { useMetadata } from "./use-metadata";
import { graphqlQuery } from "../twenty/graphql-client";

interface AggregateDataPoint {
  label: string;
  value: number;
  color: string;
}

interface UseAggregateDataResult {
  data: AggregateDataPoint[];
  loading: boolean;
  error: Error | null;
}

// Untitled UI design-token-friendly palette for chart segments
const CHART_COLORS = [
  "var(--color-utility-brand-500)",
  "var(--color-utility-blue-500)",
  "var(--color-utility-green-500)",
  "var(--color-utility-orange-500)",
  "var(--color-utility-purple-500)",
  "var(--color-utility-pink-500)",
  "var(--color-utility-indigo-500)",
  "var(--color-utility-yellow-500)",
  "var(--color-utility-sky-500)",
  "var(--color-utility-red-500)",
];

export function useAggregateData(
  objectName: string | null,
  fieldName: string | null,
): UseAggregateDataResult {
  const { getNavigableObjects, loading: metadataLoading } = useMetadata();
  const [data, setData] = useState<AggregateDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!objectName || !fieldName) {
      setData([]);
      setLoading(false);
      return;
    }

    const objects = getNavigableObjects();
    const object = objects.find(
      (o: ObjectMetadata) => o.nameSingular === objectName,
    );
    if (!object) {
      setData([]);
      setLoading(false);
      return;
    }

    const field = object.fields.find((f) => f.name === fieldName);
    if (!field) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch records with just the field we need to aggregate
      const fieldSelection =
        field.type === "SELECT" || field.type === "TEXT"
          ? fieldName
          : field.type === "FULL_NAME"
            ? `${fieldName} { firstName lastName }`
            : fieldName;

      const query = `{
        ${object.namePlural}(first: 500) {
          edges {
            node {
              id
              ${fieldSelection}
            }
          }
        }
      }`;

      const result = await graphqlQuery<
        Record<
          string,
          { edges: { node: Record<string, unknown> }[] }
        >
      >(query);

      const edges = result[object.namePlural]?.edges ?? [];

      // Group by field value
      const counts = new Map<string, number>();
      for (const edge of edges) {
        let rawValue = edge.node[fieldName];

        // Handle composite field types
        if (
          rawValue &&
          typeof rawValue === "object" &&
          "firstName" in (rawValue as Record<string, unknown>)
        ) {
          const nameObj = rawValue as {
            firstName?: string;
            lastName?: string;
          };
          rawValue = [nameObj.firstName, nameObj.lastName]
            .filter(Boolean)
            .join(" ");
        }

        const label =
          rawValue != null && rawValue !== ""
            ? String(rawValue)
            : "(empty)";
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }

      // Sort by count descending, take top 10
      const sorted = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const aggregated: AggregateDataPoint[] = sorted.map(
        ([label, value], index) => ({
          label,
          value,
          color: CHART_COLORS[index % CHART_COLORS.length],
        }),
      );

      setData(aggregated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [objectName, fieldName, getNavigableObjects]);

  useEffect(() => {
    if (metadataLoading) return;
    fetchData();
  }, [metadataLoading, fetchData]);

  return { data, loading: metadataLoading || loading, error };
}
