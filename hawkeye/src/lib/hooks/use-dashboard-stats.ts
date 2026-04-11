"use client";

import { useCallback, useEffect, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { useMetadata } from "./use-metadata";
import { graphqlQuery } from "../twenty/graphql-client";

interface ObjectStat {
  name: string;
  label: string;
  icon: string;
  count: number;
}

interface UseDashboardStatsResult {
  objectStats: ObjectStat[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function buildCountQuery(objects: ObjectMetadata[]): string {
  const fragments = objects.map(
    (obj) => `${obj.namePlural}(first: 1) { totalCount }`,
  );
  return `{ ${fragments.join("\n")} }`;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const { getNavigableObjects, loading: metadataLoading } = useMetadata();
  const [objectStats, setObjectStats] = useState<ObjectStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    const objects = getNavigableObjects();
    if (objects.length === 0) {
      setObjectStats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = buildCountQuery(objects);
      const data = await graphqlQuery<
        Record<string, { totalCount: number }>
      >(query);

      const stats: ObjectStat[] = objects.map((obj) => ({
        name: obj.nameSingular,
        label: obj.labelPlural,
        icon: obj.icon,
        count: data[obj.namePlural]?.totalCount ?? 0,
      }));

      setObjectStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [getNavigableObjects]);

  useEffect(() => {
    if (metadataLoading) return;
    fetchStats();
  }, [metadataLoading, fetchStats]);

  return {
    objectStats,
    loading: metadataLoading || loading,
    error,
    refetch: fetchStats,
  };
}
