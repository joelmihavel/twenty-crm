"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata, RecordData } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildListQuery, getVisibleFields } from "../twenty/query-builder";
import { exportToCsv } from "../csv-export";
import { useToast } from "./use-toast";

const PAGE_SIZE = 200;
const MAX_PAGES = 1000;

export function useExportRecords(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const exportAll = useCallback(
    async (filename?: string) => {
      if (!object) return;
      setLoading(true);
      try {
        const allRecords: RecordData[] = [];
        let after: string | undefined;
        let hasNextPage = true;
        let pageCount = 0;

        while (hasNextPage && pageCount < MAX_PAGES) {
          const query = buildListQuery(object, {
            first: PAGE_SIZE,
            after,
          });

          const data = await graphqlQuery<
            Record<
              string,
              {
                edges: { node: RecordData }[];
                totalCount: number;
                pageInfo: { hasNextPage: boolean; endCursor: string };
              }
            >
          >(query);

          const result = data[object.namePlural];
          const records = result.edges.map((e) => e.node);
          allRecords.push(...records);

          hasNextPage = result.pageInfo.hasNextPage;
          after = result.pageInfo.endCursor;
          pageCount++;
        }

        const fields = getVisibleFields(object);
        exportToCsv(
          allRecords,
          fields,
          filename ?? `${object.labelPlural}-all`,
        );
        toast(`Exported ${allRecords.length} records`, "success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed";
        toast(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [object, toast],
  );

  return { exportAll, loading };
}
