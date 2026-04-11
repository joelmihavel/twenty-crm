"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus } from "@untitledui/icons";
import { resolveEntity } from "@/lib/entity-config";
import { EntityPage } from "@/components/views/entity-page";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { useObjectRecords } from "@/lib/hooks/use-object-records";
import { useDeleteRecord } from "@/lib/hooks/use-delete-record";
import { useBulkActions } from "@/lib/hooks/use-bulk-actions";
import { useExportRecords } from "@/lib/hooks/use-export-records";
import { exportToCsv } from "@/lib/csv-export";
import { useToast } from "@/lib/hooks/use-toast";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { getVisibleFields, filterPopulatedFields, MAX_TABLE_COLUMNS } from "@/lib/twenty/query-builder";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import { getRecordTitle } from "@/lib/twenty/record-utils";
import type { FieldMetadata, RecordData } from "@/lib/twenty/types";
import { FieldRenderer } from "@/components/fields/field-renderer";
import { Breadcrumbs } from "@/components/views/breadcrumbs";
import { Table, TableCard } from "@/components/application/table/table";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Edit01, Trash01, Download01 } from "@untitledui/icons";
import { BulkActionBar } from "@/components/views/bulk-action-bar";
import { FilterBar, buildFilterObject } from "@/components/views/filter-bar";
import type { FilterCondition } from "@/components/views/filter-bar";
import { CreateRecordModal } from "@/components/views/create-record-modal";
import { RecordDetail } from "@/components/views/record-detail";
import { RecordCard } from "@/components/views/record-card";
import { ViewSwitcher } from "@/components/views/view-switcher";
import type { ViewType } from "@/components/views/view-switcher";
import { KanbanView } from "@/components/views/kanban-view";
import { CalendarView } from "@/components/views/calendar-view";
import { getObjectViewConfig } from "./object-config";
import { DialogTrigger, ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import type { Selection, SortDescriptor } from "react-aria-components";

const PAGE_SIZE = 50;

export default function ObjectPage({
  params,
}: {
  params: Promise<{ objectSlug: string }>;
}) {
  const { objectSlug } = use(params);

  // Check if this slug maps to an entity config
  const entity = resolveEntity(objectSlug);

  // If it matches an entity, render the rich entity page
  if (entity) {
    return <EntityPage entity={entity} />;
  }

  // Otherwise, fall through to the generic table view
  return <GenericObjectPage objectSlug={objectSlug} />;
}

// Generic table view for objects not part of the 8 core entities
function GenericObjectPage({ objectSlug }: { objectSlug: string }) {
  const { getObject, loading: metaLoading } = useMetadata();
  const object = getObject(objectSlug);
  const isDesktop = useBreakpoint("lg");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // View state from URL params, falling back to object-specific default
  const viewConfig = getObjectViewConfig(objectSlug);
  const currentView = (searchParams.get("view") as ViewType) || viewConfig.defaultView;

  const setCurrentView = useCallback(
    (view: ViewType) => {
      const params = new URLSearchParams(searchParams.toString());
      if (view === viewConfig.defaultView) {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname, viewConfig.defaultView],
  );

  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordData | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Listen for create-record event from mobile bottom nav
  useEffect(() => {
    const handleCreateEvent = () => setIsCreateOpen(true);
    document.addEventListener("hawkeye:create-record", handleCreateEvent);
    return () => document.removeEventListener("hawkeye:create-record", handleCreateEvent);
  }, []);

  const orderBy = useMemo(() => {
    if (!sortDescriptor?.column || !object) return undefined;
    const colId = String(sortDescriptor.column);
    return {
      field: colId,
      direction: sortDescriptor.direction === "ascending"
        ? "AscNullsFirst" as const
        : "DescNullsFirst" as const,
    };
  }, [sortDescriptor, object]);

  const filterObject = useMemo(() => buildFilterObject(filters), [filters]);

  // Track cursor for pagination
  const [afterCursor, setAfterCursor] = useState<string | undefined>();

  const {
    records,
    totalCount,
    loading: recordsLoading,
    error: recordsError,
    endCursor,
    refetch,
  } = useObjectRecords(object, {
    first: PAGE_SIZE,
    after: afterCursor,
    filter: filterObject,
    orderBy,
  });

  const { deleteRecord } = useDeleteRecord(object);
  const { deleteMany, loading: bulkDeleteLoading } = useBulkActions(object);
  const { exportAll, loading: exportAllLoading } = useExportRecords(object);
  const { toast } = useToast();
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Base visible fields from smart scoring (before record-aware filtering)
  const baseVisibleFields = useMemo(() => {
    if (!object) return [];
    return getVisibleFields(object).filter(
      (f) => FIELD_TYPE_REGISTRY[f.type]?.showInTable,
    );
  }, [object]);

  // Filter out empty columns and cap at MAX_TABLE_COLUMNS for desktop table
  const visibleFields = useMemo(() => {
    if (records.length === 0) return baseVisibleFields.slice(0, MAX_TABLE_COLUMNS);
    return filterPopulatedFields(baseVisibleFields, records).slice(0, MAX_TABLE_COLUMNS);
  }, [baseVisibleFields, records]);

  // All visible fields (for card view, not limited to showInTable)
  const allVisibleFields = useMemo(() => {
    if (!object) return [];
    return getVisibleFields(object);
  }, [object]);

  // Check if object has SELECT or DATE fields for view availability
  const hasSelectFields = useMemo(() => {
    if (!object) return false;
    return object.fields.some((f) => f.type === "SELECT" && f.options && f.options.length > 0);
  }, [object]);

  const hasDateFields = useMemo(() => {
    if (!object) return false;
    return object.fields.some(
      (f) => (f.type === "DATE" || f.type === "DATE_TIME") && !["createdAt", "updatedAt", "deletedAt"].includes(f.name),
    );
  }, [object]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleDeleteRecord = useCallback(async (id: string) => {
    const ok = await deleteRecord(id);
    if (ok) {
      toast(`${object?.labelSingular ?? "Record"} deleted successfully`, "success");
      refetch();
    } else {
      toast(`Failed to delete ${object?.labelSingular?.toLowerCase() ?? "record"}`, "error");
    }
    setDeleteConfirmId(null);
  }, [deleteRecord, refetch, toast, object]);

  // Derive selected IDs from Selection type
  const selectedIds = useMemo(() => {
    if (selectedKeys === "all") return records.map((r) => r.id);
    return Array.from(selectedKeys).map(String);
  }, [selectedKeys, records]);

  const selectedCount = selectedIds.length;

  // Bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    const ok = await deleteMany(selectedIds);
    if (ok) {
      toast(`${selectedIds.length} record(s) deleted successfully`, "success");
      setSelectedKeys(new Set());
      refetch();
    } else {
      toast("Failed to delete selected records", "error");
    }
    setBulkDeleteConfirm(false);
  }, [deleteMany, selectedIds, toast, refetch]);

  // Export selected records
  const handleExportSelected = useCallback(() => {
    if (!object) return;
    const selectedRecords =
      selectedKeys === "all"
        ? records
        : records.filter((r) => (selectedKeys as Set<string | number>).has(r.id));
    exportToCsv(selectedRecords, visibleFields, `${object.labelPlural}-selected`);
  }, [object, selectedKeys, records, visibleFields]);

  // Export current page
  const handleExportCurrentPage = useCallback(() => {
    if (!object) return;
    exportToCsv(records, visibleFields, object.labelPlural);
  }, [object, records, visibleFields]);

  // Loading state: metadata not loaded yet
  if (metaLoading) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center">
        <LoadingIndicator size="lg" label="Loading metadata..." />
      </div>
    );
  }

  // Object not found
  if (!object) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center p-8">
        <EmptyState size="lg">
          <EmptyState.Header>
            <EmptyState.FeaturedIcon color="error" theme="light" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Object not found</EmptyState.Title>
            <EmptyState.Description>
              The object &quot;{objectSlug}&quot; does not exist or is not active.
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Breadcrumbs */}
      <Breadcrumbs
        segments={[
          { label: object.labelPlural, href: `/${object.nameSingular}` },
          ...(selectedRecord
            ? [{ label: getRecordTitle(selectedRecord, visibleFields) }]
            : []),
        ]}
        className="border-b border-secondary"
      />

      {/* Table Card */}
      <TableCard.Root size="sm" className="flex-1 flex flex-col rounded-none shadow-none ring-0 border-b border-secondary">
        <TableCard.Header
          title={object.labelPlural}
          badge={String(totalCount)}
          description={`Manage your ${object.labelPlural.toLowerCase()}`}
          contentTrailing={
            <div className="flex items-center gap-2 md:gap-3">
              {/* View switcher: hidden on mobile */}
              <div className="hidden md:block">
                <ViewSwitcher
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  hasSelectFields={hasSelectFields}
                  hasDateFields={hasDateFields}
                />
              </div>
              {/* Export dropdown */}
              <Dropdown.Root>
                <Button
                  size="sm"
                  color="secondary"
                  iconLeading={Download01}
                  className="hidden md:inline-flex"
                  aria-label={`Export ${object.labelPlural}`}
                >
                  Export
                </Button>
                <Dropdown.Popover className="w-min">
                  <Dropdown.Menu
                    onAction={(key) => {
                      if (key === "current") handleExportCurrentPage();
                      if (key === "all") exportAll();
                    }}
                  >
                    <Dropdown.Item id="current" icon={Download01}>
                      <span className="pr-4 whitespace-nowrap">Export current page</span>
                    </Dropdown.Item>
                    <Dropdown.Item id="all" icon={Download01}>
                      <span className="pr-4 whitespace-nowrap">
                        {exportAllLoading ? "Exporting..." : "Export all records"}
                      </span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown.Root>
              {/* Create button: hidden on mobile (available via bottom nav) */}
              <Button
                size="sm"
                color="primary"
                iconLeading={Plus}
                onClick={() => setIsCreateOpen(true)}
                className="hidden md:inline-flex"
              >
                New {object.labelSingular}
              </Button>
              {/* Mobile: icon-only create button */}
              <Button
                size="sm"
                color="primary"
                iconLeading={Plus}
                onClick={() => setIsCreateOpen(true)}
                className="md:hidden"
                aria-label={`Create new ${object.labelSingular}`}
              />
            </div>
          }
        />

        {/* Filter bar (shown for all views) */}
        <div className="px-3 py-2 md:px-6 md:py-3 border-b border-secondary">
          <FilterBar
            object={object}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Loading records */}
        {recordsLoading && records.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-20">
            <LoadingIndicator size="md" label={`Loading ${object.labelPlural.toLowerCase()}...`} />
          </div>
        )}

        {/* Error state */}
        {recordsError && (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState size="md">
              <EmptyState.Header>
                <EmptyState.FeaturedIcon color="error" theme="light" />
              </EmptyState.Header>
              <EmptyState.Content>
                <EmptyState.Title>Failed to load records</EmptyState.Title>
                <EmptyState.Description>
                  {recordsError.message}
                </EmptyState.Description>
              </EmptyState.Content>
              <EmptyState.Footer>
                <Button size="sm" color="secondary" onClick={refetch}>
                  Retry
                </Button>
              </EmptyState.Footer>
            </EmptyState>
          </div>
        )}

        {/* Empty state */}
        {!recordsLoading && !recordsError && records.length === 0 && (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState size="md">
              <EmptyState.Header>
                <EmptyState.FeaturedIcon color="gray" theme="modern" />
              </EmptyState.Header>
              <EmptyState.Content>
                <EmptyState.Title>No {object.labelPlural.toLowerCase()} yet</EmptyState.Title>
                <EmptyState.Description>
                  Get started by creating your first {object.labelSingular.toLowerCase()}.
                </EmptyState.Description>
              </EmptyState.Content>
              <EmptyState.Footer>
                <Button
                  size="sm"
                  color="primary"
                  iconLeading={Plus}
                  onClick={() => setIsCreateOpen(true)}
                >
                  New {object.labelSingular}
                </Button>
              </EmptyState.Footer>
            </EmptyState>
          </div>
        )}

        {/* View content (only when records are loaded and no error) */}
        {!recordsLoading && !recordsError && records.length > 0 && (
          <>
            {/* Table view */}
            {currentView === "table" && (
              <>
                {/* Desktop: table rows */}
                <div className="hidden md:block">
                  <Table
                    aria-label={`${object.labelPlural} table`}
                    selectionMode="multiple"
                    selectionBehavior="toggle"
                    selectedKeys={selectedKeys}
                    onSelectionChange={setSelectedKeys}
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                  >
                    <Table.Header>
                      {visibleFields.map((field) => (
                        <Table.Head
                          key={field.name}
                          id={field.name}
                          label={field.label}
                          allowsSorting={FIELD_TYPE_REGISTRY[field.type]?.sortable}
                        />
                      ))}
                      <Table.Head id="actions" label="" />
                    </Table.Header>

                    <Table.Body items={records}>
                      {(record) => (
                        <Table.Row
                          key={record.id}
                          id={record.id}
                          onAction={() => setSelectedRecord(record)}
                        >
                          {visibleFields.map((field) => (
                            <Table.Cell key={field.name}>
                              <FieldRenderer field={field} value={record[field.name]} />
                            </Table.Cell>
                          ))}
                          <Table.Cell>
                            <RowActions
                              onEdit={() => setSelectedRecord(record)}
                              onDelete={() => setDeleteConfirmId(record.id)}
                            />
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </div>

                {/* Mobile: card list */}
                <div className="md:hidden flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-2 p-3 pb-20">
                    {records.map((record) => (
                      <RecordCard
                        key={record.id}
                        record={record}
                        visibleFields={allVisibleFields}
                        onClick={() => setSelectedRecord(record)}
                      />
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <PaginationCardMinimal
                    page={currentPage}
                    total={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      // Forward pagination: use endCursor for next page
                      if (page > currentPage && endCursor) {
                        setAfterCursor(endCursor);
                      } else if (page === 1) {
                        setAfterCursor(undefined);
                      }
                    }}
                  />
                )}
              </>
            )}

            {/* Kanban view */}
            {currentView === "kanban" && hasSelectFields && (
              <KanbanView
                object={object}
                records={records}
                onRecordClick={setSelectedRecord}
                onRecordUpdated={refetch}
              />
            )}

            {/* Calendar view */}
            {currentView === "calendar" && hasDateFields && (
              <CalendarView
                object={object}
                records={records}
                onRecordClick={setSelectedRecord}
              />
            )}
          </>
        )}
      </TableCard.Root>

      {/* Create modal */}
      <CreateRecordModal
        object={object}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={refetch}
      />

      {/* Detail slideout (full screen on mobile) */}
      {selectedRecord && (
        <RecordDetail
          object={object}
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdated={() => {
            refetch();
            setSelectedRecord(null);
          }}
        />
      )}

      {/* Delete confirmation dialog (single record) — Modal */}
      <DialogTrigger isOpen={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <ModalOverlay>
          <Modal className="max-w-sm">
            <Dialog>
              <div className="w-full rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                <h3 className="text-lg font-semibold text-primary">Delete {object.labelSingular}?</h3>
                <p className="mt-2 text-sm text-tertiary">
                  This action cannot be undone. Are you sure you want to delete this {object.labelSingular.toLowerCase()}?
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <Button size="sm" color="secondary" onClick={() => setDeleteConfirmId(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    color="primary-destructive"
                    iconLeading={Trash01}
                    onClick={() => {
                      if (deleteConfirmId) handleDeleteRecord(deleteConfirmId);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>

      {/* Bulk delete confirmation dialog — Modal */}
      <DialogTrigger isOpen={bulkDeleteConfirm} onOpenChange={(open) => { if (!open) setBulkDeleteConfirm(false); }}>
        <ModalOverlay>
          <Modal className="max-w-sm">
            <Dialog>
              <div className="w-full rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                <h3 className="text-lg font-semibold text-primary">
                  Delete {selectedCount} {selectedCount === 1 ? object.labelSingular : object.labelPlural}?
                </h3>
                <p className="mt-2 text-sm text-tertiary">
                  This action cannot be undone. Are you sure you want to delete{" "}
                  {selectedCount === 1
                    ? `this ${object.labelSingular.toLowerCase()}`
                    : `these ${selectedCount} ${object.labelPlural.toLowerCase()}`}?
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <Button size="sm" color="secondary" onClick={() => setBulkDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    color="primary-destructive"
                    iconLeading={Trash01}
                    isLoading={bulkDeleteLoading}
                    showTextWhileLoading
                    onClick={handleBulkDelete}
                  >
                    Delete {selectedCount}
                  </Button>
                </div>
              </div>
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>

      {/* Bulk action bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        onDelete={() => setBulkDeleteConfirm(true)}
        onExport={handleExportSelected}
        onClear={() => setSelectedKeys(new Set())}
        isDeleting={bulkDeleteLoading}
      />
    </div>
  );
}

// Row-level action dropdown
function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Dropdown.Root>
      <Dropdown.DotsButton />
      <Dropdown.Popover className="w-min">
        <Dropdown.Menu onAction={(key) => {
          if (key === "edit") onEdit();
          if (key === "delete") onDelete();
        }}>
          <Dropdown.Item id="edit" icon={Edit01}>
            <span className="pr-4">Edit</span>
          </Dropdown.Item>
          <Dropdown.Item id="delete" icon={Trash01}>
            <span className="pr-4">Delete</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
