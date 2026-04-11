"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildUpdateMutation } from "../twenty/query-builder";

export function useUpdateRecord(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateRecord = useCallback(async (id: string, data: Record<string, unknown>): Promise<boolean> => {
    if (!object) return false;
    setLoading(true);
    setError(null);

    try {
      const mutation = buildUpdateMutation(object);
      await graphqlQuery(mutation, { id, data });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [object]);

  return { updateRecord, loading, error };
}
