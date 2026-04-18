"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ObjectMetadata, RecordData } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildListQuery } from "../twenty/query-builder";

interface UseObjectRecordsOptions {
  first?: number;
  after?: string;
  filter?: Record<string, unknown>;
  orderBy?: { field: string; direction: "AscNullsFirst" | "DescNullsFirst" };
}

interface UseObjectRecordsResult {
  records: RecordData[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  endCursor: string | undefined;
  refetch: () => void;
  loadMore: () => void;
}

export function useObjectRecords(
  object: ObjectMetadata | null,
  options: UseObjectRecordsOptions = {},
): UseObjectRecordsResult {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const recordsRef = useRef<RecordData[]>([]);
  const endCursorRef = useRef<string | undefined>(undefined);

  // Memoize serialized filter and orderBy to avoid stringify in dependency array (Fix 6)
  const serializedFilter = useMemo(
    () => (options.filter ? JSON.stringify(options.filter) : ""),
    [options.filter],
  );

  const serializedOrderBy = useMemo(
    () => (options.orderBy ? JSON.stringify(options.orderBy) : ""),
    [options.orderBy],
  );

  // Keep refs in sync
  recordsRef.current = records;
  endCursorRef.current = endCursor;

  const fetchRecords = useCallback(async (append = false) => {
    if (!object) return;
    setLoading(true);
    setError(null);

    try {
      const parsedFilter = serializedFilter ? JSON.parse(serializedFilter) : undefined;
      const parsedOrderBy = serializedOrderBy ? JSON.parse(serializedOrderBy) : undefined;

      const query = buildListQuery(object, {
        first: options.first ?? 50,
        after: append ? endCursorRef.current : (options.after ?? undefined),
        filter: parsedFilter,
        orderBy: parsedOrderBy,
      });

      const data = await graphqlQuery<Record<string, {
        edges: { node: RecordData }[];
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string };
      }>>(query);

      const result = data[object.namePlural];
      const newRecords = result.edges.map((e) => e.node);

      setRecords(append ? [...recordsRef.current, ...newRecords] : newRecords);
      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setEndCursor(result.pageInfo.endCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [object, options.first, options.after, serializedFilter, serializedOrderBy]);

  useEffect(() => {
    fetchRecords(false);
  }, [fetchRecords]);

  return {
    records,
    totalCount,
    loading,
    error,
    hasNextPage,
    endCursor,
    refetch: () => fetchRecords(false),
    loadMore: () => fetchRecords(true),
  };
}
