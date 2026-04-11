"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SearchLg,
  ArrowRight,
} from "@untitledui/icons";
import type { FC } from "react";
import type { ObjectMetadata, RecordData } from "@/lib/twenty/types";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { graphqlQuery } from "@/lib/twenty/graphql-client";
import { getIconForObject, Cube01 } from "@/lib/twenty/object-icons";
import { getRecordTitle } from "@/lib/twenty/record-utils";
import { ModalOverlay, Modal, Dialog, DialogTrigger } from "@/components/application/modals/modal";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  objectName: string;
  objectLabel: string;
  record: RecordData;
  objectFields: import("@/lib/twenty/types").FieldMetadata[];
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { getNavigableObjects, loading: metaLoading } = useMetadata();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const navigableObjects = useMemo(() => getNavigableObjects(), [getNavigableObjects]);

  // Build flat list of all selectable items
  const items = useMemo(() => {
    const result: Array<{
      id: string;
      type: "navigate" | "record";
      label: string;
      sublabel?: string;
      icon: FC<{ className?: string }>;
      onSelect: () => void;
    }> = [];

    // Filter objects by query
    const filteredObjects = query
      ? navigableObjects.filter((obj) =>
          obj.labelPlural.toLowerCase().includes(query.toLowerCase()) ||
          obj.nameSingular.toLowerCase().includes(query.toLowerCase()),
        )
      : navigableObjects;

    filteredObjects.forEach((obj) => {
      const Icon = getIconForObject(obj);
      result.push({
        id: `nav-${obj.nameSingular}`,
        type: "navigate",
        label: obj.labelPlural,
        icon: Icon,
        onSelect: () => {
          router.push(`/${obj.nameSingular}`);
          onClose();
        },
      });
    });

    // Add search results
    searchResults.forEach((sr) => {
      result.push({
        id: `record-${sr.record.id}`,
        type: "record",
        label: getRecordTitle(sr.record, sr.objectFields),
        sublabel: sr.objectLabel,
        icon: Cube01,
        onSelect: () => {
          // Navigate to the object table (record detail view)
          router.push(`/${sr.objectName}`);
          onClose();
        },
      });
    });

    return result;
  }, [navigableObjects, searchResults, query, router, onClose]);

  // Search across records when query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      // Abort previous search (Fix 22)
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      try {
        const results: SearchResult[] = [];

        // Search across key objects that support text search
        const searchableObjects = navigableObjects.filter((obj) =>
          ["person", "company", "opportunity", "note", "task"].includes(obj.nameSingular),
        );

        const searches = searchableObjects.map(async (obj) => {
          // Build a simple name-based filter depending on object type
          let filter: Record<string, unknown> = {};

          if (obj.nameSingular === "person") {
            filter = {
              or: [
                { name: { firstName: { like: `%${query}%` } } },
                { name: { lastName: { like: `%${query}%` } } },
              ],
            };
          } else if (obj.nameSingular === "company") {
            filter = { name: { like: `%${query}%` } };
          } else {
            // Generic: try filtering on name or title
            const hasNameField = obj.fields.some((f) => f.name === "name" && f.type === "TEXT");
            const hasTitleField = obj.fields.some((f) => f.name === "title" && f.type === "TEXT");
            if (hasNameField) {
              filter = { name: { like: `%${query}%` } };
            } else if (hasTitleField) {
              filter = { title: { like: `%${query}%` } };
            } else {
              return; // Skip objects without searchable text fields
            }
          }

          const filterStr = JSON.stringify(filter).replace(/"([^"]+)":/g, "$1:");

          const gqlQuery = `{
            ${obj.namePlural}(first: 5, filter: ${filterStr}) {
              edges {
                node {
                  id
                  ${obj.nameSingular === "person" ? "name { firstName lastName }" : ""}
                  ${obj.nameSingular === "company" ? "name" : ""}
                  ${obj.fields.some((f) => f.name === "title" && f.type === "TEXT") ? "title" : ""}
                }
              }
            }
          }`;

          try {
            const data = await graphqlQuery<Record<string, { edges: { node: RecordData }[] }>>(gqlQuery);
            const records = data[obj.namePlural]?.edges?.map((e) => e.node) ?? [];
            records.forEach((record) => {
              results.push({
                objectName: obj.nameSingular,
                objectLabel: obj.labelSingular,
                record,
                objectFields: obj.fields,
              });
            });
          } catch {
            // Silently skip objects that fail to search
          }
        });

        await Promise.allSettled(searches);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, navigableObjects]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setSearchResults([]);
      // Focus the input after modal animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keep active index in bounds
  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, activeIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((prev) => (prev + 1) % Math.max(1, items.length));
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
          break;
        case "Enter":
          event.preventDefault();
          if (items[activeIndex]) {
            items[activeIndex].onSelect();
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [items, activeIndex, onClose],
  );

  // Scroll active item into view
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const activeElement = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    activeElement?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  const hasNavigateResults = items.some((i) => i.type === "navigate");
  const hasRecordResults = items.some((i) => i.type === "record");

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <ModalOverlay>
        <Modal className="max-w-lg">
          <Dialog>
            <div
              className="w-full overflow-hidden rounded-xl bg-primary shadow-xl ring-1 ring-secondary"
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-secondary px-4 py-3">
                <SearchLg className="size-5 shrink-0 text-fg-quaternary" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="Search or jump to..."
                  className="w-full bg-transparent text-md text-primary outline-none placeholder:text-placeholder"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <kbd className="hidden shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-quaternary ring-1 ring-secondary ring-inset select-none sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-80 overflow-y-auto overscroll-contain py-2"
                role="listbox"
              >
                {/* Loading state */}
                {metaLoading && (
                  <div className="px-4 py-8 text-center text-sm text-tertiary">
                    Loading...
                  </div>
                )}

                {/* Empty state */}
                {!metaLoading && items.length === 0 && query.length > 0 && !searching && (
                  <div className="px-4 py-8 text-center text-sm text-tertiary">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                )}

                {/* Navigate section */}
                {hasNavigateResults && (
                  <>
                    <div className="px-4 pb-1 pt-2 text-xs font-medium text-quaternary uppercase">
                      Navigate
                    </div>
                    {items
                      .map((item, index) => ({ item, index }))
                      .filter(({ item }) => item.type === "navigate")
                      .map(({ item, index }) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            data-index={index}
                            role="option"
                            aria-selected={index === activeIndex}
                            onClick={item.onSelect}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors duration-75 ${
                              index === activeIndex
                                ? "bg-active"
                                : "hover:bg-primary_hover"
                            }`}
                          >
                            <Icon className="size-4 shrink-0 text-fg-secondary" />
                            <span className="flex-1 truncate text-sm font-medium text-secondary">
                              {item.label}
                            </span>
                            <ArrowRight className="size-3.5 shrink-0 text-fg-quaternary" />
                          </button>
                        );
                      })}
                  </>
                )}

                {/* Search results section */}
                {(hasRecordResults || searching) && (
                  <>
                    <div className="px-4 pb-1 pt-3 text-xs font-medium text-quaternary uppercase">
                      {searching ? "Searching..." : "Records"}
                    </div>
                    {items
                      .map((item, index) => ({ item, index }))
                      .filter(({ item }) => item.type === "record")
                      .map(({ item, index }) => (
                        <button
                          key={item.id}
                          data-index={index}
                          role="option"
                          aria-selected={index === activeIndex}
                          onClick={item.onSelect}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors duration-75 ${
                            index === activeIndex
                              ? "bg-active"
                              : "hover:bg-primary_hover"
                          }`}
                        >
                          <Cube01 className="size-4 shrink-0 text-fg-tertiary" />
                          <div className="flex flex-1 flex-col truncate">
                            <span className="truncate text-sm font-medium text-secondary">
                              {item.label}
                            </span>
                            {item.sublabel && (
                              <span className="truncate text-xs text-tertiary">
                                {item.sublabel}
                              </span>
                            )}
                          </div>
                          <ArrowRight className="size-3.5 shrink-0 text-fg-quaternary" />
                        </button>
                      ))}
                  </>
                )}

                {/* Default hint when no query */}
                {!metaLoading && items.length > 0 && !query && (
                  <div className="border-t border-secondary px-4 py-2 mt-1">
                    <p className="text-xs text-quaternary">
                      Type to search records across all objects
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
