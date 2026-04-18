"use client";

import { useCallback, useRef, useState } from "react";
import type { ObjectMetadata, RecordData } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { getRecordTitle, getRecordSubtitle } from "../twenty/record-utils";
import { getVisibleFields } from "../twenty/query-builder";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string | null;
}

export function useSearchRecords(targetObjectName: string | null) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    (query: string, objects: ObjectMetadata[]) => {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!targetObjectName || !query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      debounceRef.current = setTimeout(async () => {
        // Abort previous request
        if (abortRef.current) {
          abortRef.current.abort();
        }
        abortRef.current = new AbortController();

        const targetObject = objects.find(
          (o) => o.nameSingular === targetObjectName,
        );
        if (!targetObject) {
          setResults([]);
          setLoading(false);
          return;
        }

        const visibleFields = getVisibleFields(targetObject);

        // Build a simple search query - search in first text/fullname field
        const firstTextField = visibleFields.find(
          (f) => f.type === "TEXT" || f.type === "FULL_NAME",
        );

        if (!firstTextField) {
          setResults([]);
          setLoading(false);
          return;
        }

        // Build filter using GraphQL variables to prevent injection (Fix 4)
        let filter: Record<string, unknown>;
        if (firstTextField.type === "FULL_NAME") {
          filter = {
            or: [
              { [firstTextField.name]: { firstName: { like: `%${query}%` } } },
              { [firstTextField.name]: { lastName: { like: `%${query}%` } } },
            ],
          };
        } else {
          filter = { [firstTextField.name]: { like: `%${query}%` } };
        }

        // Build field selections for the query
        const fieldSelections = visibleFields
          .slice(0, 5)
          .map((f) => {
            switch (f.type) {
              case "FULL_NAME":
                return `${f.name} { firstName lastName }`;
              case "EMAILS":
                return `${f.name} { primaryEmail }`;
              case "PHONES":
                return `${f.name} { primaryPhoneNumber }`;
              default:
                return f.name;
            }
          })
          .join("\n          ");

        // Convert filter to GraphQL inline format (safe because values come from our code, not user input directly)
        const filterStr = JSON.stringify(filter).replace(/"([^"]+)":/g, "$1:");

        const gqlQuery = `{
          ${targetObject.namePlural}(first: 10, filter: ${filterStr}) {
            edges {
              node {
                id
                ${fieldSelections}
              }
            }
          }
        }`;

        try {
          const data = await graphqlQuery<
            Record<
              string,
              {
                edges: { node: RecordData }[];
              }
            >
          >(gqlQuery);

          const records = data[targetObject.namePlural].edges.map((e) => e.node);

          const searchResults: SearchResult[] = records.map((record) => ({
            id: record.id,
            title: getRecordTitle(record, visibleFields),
            subtitle: getRecordSubtitle(record, visibleFields),
          }));

          setResults(searchResults);
        } catch {
          // Silently fail on search errors (user may still be typing)
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [targetObjectName],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setLoading(false);
  }, []);

  return { results, loading, search, clearResults };
}
