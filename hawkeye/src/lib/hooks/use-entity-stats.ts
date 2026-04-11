"use client";

import { useCallback, useEffect, useState } from "react";
import type { EntityConfig } from "@/lib/entity-config";
import { useMetadata } from "./use-metadata";
import { graphqlQuery } from "../twenty/graphql-client";

interface EntityStats {
  core: number;
  children: Record<string, number>;
  loading: boolean;
  error: Error | null;
}

export function useEntityStats(entity: EntityConfig): EntityStats {
  const { getObject, loading: metadataLoading } = useMetadata();
  const [core, setCore] = useState(0);
  const [children, setChildren] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Gather all objects we can resolve from metadata
      const coreObject = getObject(entity.objectName);
      const childObjects = entity.children
        .map((c) => ({
          config: c,
          metadata: getObject(c.objectName),
        }))
        .filter((c) => c.metadata !== null);

      // Build a single query to fetch totalCount for all objects
      const fragments: string[] = [];

      if (coreObject) {
        fragments.push(`${coreObject.namePlural}(first: 1) { totalCount }`);
      }

      for (const child of childObjects) {
        if (child.metadata) {
          fragments.push(
            `${child.metadata.namePlural}(first: 1) { totalCount }`,
          );
        }
      }

      if (fragments.length === 0) {
        setCore(0);
        setChildren({});
        setLoading(false);
        return;
      }

      const query = `{ ${fragments.join("\n")} }`;
      const data = await graphqlQuery<
        Record<string, { totalCount: number }>
      >(query);

      if (coreObject) {
        setCore(data[coreObject.namePlural]?.totalCount ?? 0);
      }

      const childCounts: Record<string, number> = {};
      for (const child of childObjects) {
        if (child.metadata) {
          childCounts[child.config.objectName] =
            data[child.metadata.namePlural]?.totalCount ?? 0;
        }
      }
      setChildren(childCounts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [entity, getObject]);

  useEffect(() => {
    if (metadataLoading) return;
    fetchStats();
  }, [metadataLoading, fetchStats]);

  return { core, children, loading: metadataLoading || loading, error };
}
