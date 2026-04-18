"use client";

import { useCallback, useEffect, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { useMetadata } from "./use-metadata";
import { graphqlQuery } from "../twenty/graphql-client";
import { ENTITIES } from "../entity-config";

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

const BATCH_SIZE = 15; // Twenty limits to 20 root resolvers per query

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
      // Batch queries to stay under Twenty's 20 root resolver limit
      const batches: ObjectMetadata[][] = [];
      for (let i = 0; i < objects.length; i += BATCH_SIZE) {
        batches.push(objects.slice(i, i + BATCH_SIZE));
      }

      const results = await Promise.all(
        batches.map((batch) =>
          graphqlQuery<Record<string, { totalCount: number }>>(
            buildCountQuery(batch),
          ),
        ),
      );

      // Merge all batch results
      const merged: Record<string, { totalCount: number }> = {};
      for (const result of results) {
        Object.assign(merged, result);
      }

      const coreNames = new Set(ENTITIES.map((e) => e.objectName));
      const stats: ObjectStat[] = objects
        .map((obj) => ({
          name: obj.nameSingular,
          label: obj.labelPlural,
          icon: obj.icon,
          count: merged[obj.namePlural]?.totalCount ?? 0,
        }))
        .sort((a, b) => {
          const aCore = coreNames.has(a.name) ? 0 : 1;
          const bCore = coreNames.has(b.name) ? 0 : 1;
          if (aCore !== bCore) return aCore - bCore;
          return b.count - a.count;
        });

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
