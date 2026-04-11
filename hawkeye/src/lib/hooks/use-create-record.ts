"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildCreateMutation } from "../twenty/query-builder";

export function useCreateRecord(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createRecord = useCallback(async (data: Record<string, unknown>): Promise<string | null> => {
    if (!object) return null;
    setLoading(true);
    setError(null);

    try {
      const mutation = buildCreateMutation(object);
      const typeName = object.nameSingular.charAt(0).toUpperCase() + object.nameSingular.slice(1);
      const result = await graphqlQuery<Record<string, { id: string }>>(mutation, { data });
      return result[`create${typeName}`].id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, [object]);

  return { createRecord, loading, error };
}
