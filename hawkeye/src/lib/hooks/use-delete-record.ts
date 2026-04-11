"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildDeleteMutation } from "../twenty/query-builder";

export function useDeleteRecord(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    if (!object) return false;
    setLoading(true);
    setError(null);
    try {
      const mutation = buildDeleteMutation(object);
      await graphqlQuery(mutation, { id });
      return true;
    } catch (err) {
      const deleteError = err instanceof Error ? err : new Error(String(err));
      setError(deleteError);
      return false;
    } finally {
      setLoading(false);
    }
  }, [object]);

  return { deleteRecord, loading, error };
}
