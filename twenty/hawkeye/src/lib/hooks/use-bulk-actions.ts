"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildBulkDeleteMutation } from "../twenty/query-builder";

export function useBulkActions(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMany = useCallback(
    async (ids: string[]): Promise<boolean> => {
      if (!object || ids.length === 0) return false;
      setLoading(true);
      setError(null);
      try {
        const mutation = buildBulkDeleteMutation(object);
        await graphqlQuery(mutation, {
          filter: { id: { in: ids } },
        });
        return true;
      } catch (err) {
        const bulkError =
          err instanceof Error ? err : new Error(String(err));
        setError(bulkError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [object],
  );

  return { deleteMany, loading, error };
}
