"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Edit01, Trash01, Download01 } from "@untitledui/icons";
import type { EntityConfig, ChildObjectConfig } from "@/lib/entity-config";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { useObjectRecords } from "@/lib/hooks/use-object-records";
import { useDeleteRecord } from "@/lib/hooks/use-delete-record";
import { useBulkActions } from "@/lib/hooks/use-bulk-actions";
import { useExportRecords } from "@/lib/hooks/use-export-records";
import { exportToCsv } from "@/lib/csv-export";
import { useEntityStats } from "@/lib/hooks/use-entity-stats";
import { useToast } from "@/lib/hooks/use-toast";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { getVisibleFields, filterPopulatedFields, MAX_TABLE_COLUMNS } from "@/lib/twenty/query-builder";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import { getRecordTitle } from "@/lib/twenty/record-utils";
import type { RecordData } from "@/lib/twenty/types";
import { FieldRenderer } from "@/components/fields/field-renderer";
import { Breadcrumbs } from "@/components/views/breadcrumbs";
import { Table, TableCard } from "@/components/application/table/table";
import { PaginationCardMinimal } from "@/components/application/pagination/pagination";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Tabs, TabList, Tab, TabPanel } from "@/components/application/tabs/tabs";
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
import { DialogTrigger, ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import type { Selection, SortDescriptor } from "react-aria-components";
import { cx } from "@/utils/cx";

// Compact stat pill for the summary row
function formatStatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

function StatPill({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  if (loading) {
    return <div className="h-7 w-24 animate-pulse rounded-full bg-tertiary" />;
  }
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-secondary bg-primary px-3 py-1">
      <span className="text-xs text-tertiary whitespace-nowrap">{label}</span>
      <span className="text-xs font-semibold text-primary">{formatStatNumber(value)}</span>
    </div>
  );
}

const PAGE_SIZE = 50;

// Tab ID constants
const OVERVIEW_TAB = "overview";

interface EntityPageProps {
  entity: EntityConfig;
}

export function EntityPage({ entity }: EntityPageProps) {
  const { getObject, loading: metaLoading } = useMetadata();
  const isDesktop = useBreakpoint("lg");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const stats = useEntityStats(entity);

  // Active tab from URL, default to "overview"
  const activeTab = searchParams.get("tab") ?? OVERVIEW_TAB;

  // Determine which object to display based on active tab
  const activeObjectName = useMemo(() => {
    if (activeTab === OVERVIEW_TAB) return entity.objectName;
    const childConfig = entity.children.find(
      (c) => slugifyTabId(c.objectName) === activeTab,
    );
    return childConfig?.objectName ?? entity.objectName;
  }, [activeTab, entity]);

  const activeObject = getObject(activeObjectName);

  // Determine the active child config for label display
  const activeChildConfig = useMemo(() => {
    if (activeTab === OVERVIEW_TAB) return null;
    return (
      entity.children.find(
        (c) => slugifyTabId(c.objectName) === activeTab,
      ) ?? null
    );
  }, [activeTab, entity.children]);

  const activeLabel = activeChildConfig?.label ?? entity.label;

  // View state
  const currentView =
    (searchParams.get("view") as ViewType) || entity.defaultView;

  const setCurrentView = useCallback(
    (view: ViewType) => {
      const params = new URLSearchParams(searchParams.toString());
      if (view === entity.defaultView) {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [searchParams, router, pathname, entity.defaultView],
  );

  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === OVERVIEW_TAB) {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      // Reset view when switching tabs
      params.delete("view");
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [searchParams, router, pathname],
  );

  // Record state
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordData | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | undefined>();

  // Reset pagination/filters when tab changes
  useEffect(() => {
    setFilters([]);
    setSortDescriptor(undefined);
    setCurrentPage(1);
    setAfterCursor(undefined);
    setSelectedKeys(new Set());
    setSelectedRecord(null);
  }, [activeTab]);

  // Listen for create-record event from mobile bottom nav
  useEffect(() => {
    const handleCreateEvent = () => setIsCreateOpen(true);
    document.addEventListener("hawkeye:create-record", handleCreateEvent);
    return () =>
      document.removeEventListener("hawkeye:create-record", handleCreateEvent);
  }, []);

  const orderBy = useMemo(() => {
    if (!sortDescriptor?.column || !activeObject) return undefined;
    const colId = String(sortDescriptor.column);
    return {
      field: colId,
      direction:
        sortDescriptor.direction === "ascending"
          ? ("AscNullsFirst" as const)
          : ("DescNullsFirst" as const),
    };
  }, [sortDescriptor, activeObject]);

  const filterObject = useMemo(() => buildFilterObject(filters), [filters]);

  const {
    records,
    totalCount,
    loading: recordsLoading,
    error: recordsError,
    endCursor,
    refetch,
  } = useObjectRecords(activeObject, {
    first: PAGE_SIZE,
    after: afterCursor,
    filter: filterObject,
    orderBy,
  });

  const { deleteRecord } = useDeleteRecord(activeObject);
  const { deleteMany, loading: bulkDeleteLoading } = useBulkActions(activeObject);
  const { exportAll, loading: exportAllLoading } = useExportRecords(activeObject);
  const { toast } = useToast();
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Base visible fields from smart scoring (before record-aware filtering)
  const baseVisibleFields = useMemo(() => {
    if (!activeObject) return [];
    return getVisibleFields(activeObject).filter(
      (f) => FIELD_TYPE_REGISTRY[f.type]?.showInTable,
    );
  }, [activeObject]);

  // Filter out empty columns and cap at MAX_TABLE_COLUMNS for desktop table
  const visibleFields = useMemo(() => {
    if (records.length === 0) return baseVisibleFields.slice(0, MAX_TABLE_COLUMNS);
    return filterPopulatedFields(baseVisibleFields, records).slice(0, MAX_TABLE_COLUMNS);
  }, [baseVisibleFields, records]);

  const allVisibleFields = useMemo(() => {
    if (!activeObject) return [];
    return getVisibleFields(activeObject);
  }, [activeObject]);

  const hasSelectFields = useMemo(() => {
    if (!activeObject) return false;
    return activeObject.fields.some(
      (f) => f.type === "SELECT" && f.options && f.options.length > 0,
    );
  }, [activeObject]);

  const hasDateFields = useMemo(() => {
    if (!activeObject) return false;
    return activeObject.fields.some(
      (f) =>
        (f.type === "DATE" || f.type === "DATE_TIME") &&
        !["createdAt", "updatedAt", "deletedAt"].includes(f.name),
    );
  }, [activeObject]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleDeleteRecord = useCallback(
    async (id: string) => {
      const ok = await deleteRecord(id);
      if (ok) {
        toast(
          `${activeObject?.labelSingular ?? "Record"} deleted successfully`,
          "success",
        );
        refetch();
      } else {
        toast(
          `Failed to delete ${activeObject?.labelSingular?.toLowerCase() ?? "record"}`,
          "error",
        );
      }
      setDeleteConfirmId(null);
    },
    [deleteRecord, refetch, toast, activeObject],
  );

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
    if (!activeObject) return;
    const selectedRecords =
      selectedKeys === "all"
        ? records
        : records.filter((r) => (selectedKeys as Set<string | number>).has(r.id));
    exportToCsv(selectedRecords, visibleFields, `${activeObject.labelPlural}-selected`);
  }, [activeObject, selectedKeys, records, visibleFields]);

  // Export current page
  const handleExportCurrentPage = useCallback(() => {
    if (!activeObject) return;
    exportToCsv(records, visibleFields, activeObject.labelPlural);
  }, [activeObject, records, visibleFields]);

  const EntityIcon = entity.icon;

  // Loading: metadata not ready
  if (metaLoading) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center">
        <LoadingIndicator size="lg" label="Loading metadata..." />
      </div>
    );
  }

  // Core object not found
  if (!getObject(entity.objectName)) {
    return (
      <div className="flex h-full min-h-96 items-center justify-center p-8">
        <EmptyState size="lg">
          <EmptyState.Header>
            <EmptyState.FeaturedIcon color="error" theme="light" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Entity not found</EmptyState.Title>
            <EmptyState.Description>
              The entity &quot;{entity.label}&quot; could not be loaded from your
              workspace.
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
          { label: entity.label, href: `/${entity.slug}` },
          ...(activeChildConfig
            ? [{ label: activeChildConfig.label }]
            : []),
          ...(selectedRecord
            ? [{ label: getRecordTitle(selectedRecord, visibleFields) }]
            : []),
        ]}
        className="border-b border-secondary"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 border-b border-secondary">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-brand-secondary p-2">
            <EntityIcon className="size-5 text-fg-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">
              {entity.label}
            </h1>
            <p className="text-sm text-tertiary">
              Manage your {entity.label.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
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
              aria-label={`Export ${activeLabel}`}
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
          <Button
            size="sm"
            color="primary"
            iconLeading={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="hidden md:inline-flex"
          >
            New {activeChildConfig?.label ?? entity.labelSingular}
          </Button>
          <Button
            size="sm"
            color="primary"
            iconLeading={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="md:hidden"
            aria-label={`Create new ${activeChildConfig?.label ?? entity.labelSingular}`}
          />
        </div>
      </div>

      {/* Summary stats row — compact stat pills */}
      <div className="px-4 py-2 md:px-6 md:py-3 border-b border-secondary overflow-x-auto">
        <div className="flex items-center gap-2 md:gap-3 min-w-max">
          <StatPill
            label={`Total ${entity.label}`}
            value={stats.core}
            loading={stats.loading}
          />
          {entity.children.slice(0, 4).map((child) => (
            <StatPill
              key={child.objectName}
              label={child.label}
              value={stats.children[child.objectName] ?? 0}
              loading={stats.loading}
            />
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-secondary overflow-x-auto">
        <div className="px-4 md:px-6 min-w-max">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(String(key))}
          >
            <TabList type="underline" size="sm">
              <Tab id={OVERVIEW_TAB} icon={entity.icon}>
                Overview
              </Tab>
              {entity.children.map((child) => (
                <Tab
                  key={child.objectName}
                  id={slugifyTabId(child.objectName)}
                  icon={child.icon}
                  badge={
                    stats.children[child.objectName] !== undefined
                      ? stats.children[child.objectName]
                      : undefined
                  }
                >
                  {child.label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter bar */}
        {activeObject && (
          <div className="px-3 py-2 md:px-6 md:py-3 border-b border-secondary">
            <FilterBar
              object={activeObject}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}

        {/* Loading records */}
        {recordsLoading && records.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-20">
            <LoadingIndicator
              size="md"
              label={`Loading ${activeLabel.toLowerCase()}...`}
            />
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
                <EmptyState.Title>
                  No {activeLabel.toLowerCase()} yet
                </EmptyState.Title>
                <EmptyState.Description>
                  Get started by creating your first{" "}
                  {(
                    activeChildConfig?.label ?? entity.labelSingular
                  ).toLowerCase()}
                  .
                </EmptyState.Description>
              </EmptyState.Content>
              <EmptyState.Footer>
                <Button
                  size="sm"
                  color="primary"
                  iconLeading={Plus}
                  onClick={() => setIsCreateOpen(true)}
                >
                  New {activeChildConfig?.label ?? entity.labelSingular}
                </Button>
              </EmptyState.Footer>
            </EmptyState>
          </div>
        )}

        {/* View content */}
        {!recordsLoading && !recordsError && records.length > 0 && (
          <>
            {/* Table view */}
            {currentView === "table" && (
              <>
                {/* Desktop table */}
                <div className="hidden md:block flex-1 overflow-auto">
                  <Table
                    aria-label={`${activeLabel} table`}
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
                          allowsSorting={
                            FIELD_TYPE_REGISTRY[field.type]?.sortable
                          }
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
                              <FieldRenderer
                                field={field}
                                value={record[field.name]}
                              />
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

                {/* Mobile card list */}
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
            {currentView === "kanban" && hasSelectFields && activeObject && (
              <KanbanView
                object={activeObject}
                records={records}
                onRecordClick={setSelectedRecord}
                onRecordUpdated={refetch}
              />
            )}

            {/* Calendar view */}
            {currentView === "calendar" && hasDateFields && activeObject && (
              <CalendarView
                object={activeObject}
                records={records}
                onRecordClick={setSelectedRecord}
              />
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      {activeObject && (
        <CreateRecordModal
          object={activeObject}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={refetch}
        />
      )}

      {/* Detail slideout */}
      {selectedRecord && activeObject && (
        <RecordDetail
          object={activeObject}
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdated={() => {
            refetch();
            setSelectedRecord(null);
          }}
        />
      )}

      {/* Delete confirmation (single record) — Modal */}
      <DialogTrigger isOpen={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <ModalOverlay>
          <Modal className="max-w-sm">
            <Dialog>
              <div className="w-full rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                <h3 className="text-lg font-semibold text-primary">
                  Delete{" "}
                  {activeObject?.labelSingular ??
                    activeChildConfig?.label ??
                    "Record"}
                  ?
                </h3>
                <p className="mt-2 text-sm text-tertiary">
                  This action cannot be undone. Are you sure you want to delete this{" "}
                  {(
                    activeObject?.labelSingular ??
                    activeChildConfig?.label ??
                    "record"
                  ).toLowerCase()}
                  ?
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <Button
                    size="sm"
                    color="secondary"
                    onClick={() => setDeleteConfirmId(null)}
                  >
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

      {/* Bulk delete confirmation — Modal */}
      <DialogTrigger isOpen={bulkDeleteConfirm} onOpenChange={(open) => { if (!open) setBulkDeleteConfirm(false); }}>
        <ModalOverlay>
          <Modal className="max-w-sm">
            <Dialog>
              <div className="w-full rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
                <h3 className="text-lg font-semibold text-primary">
                  Delete {selectedCount}{" "}
                  {selectedCount === 1
                    ? (activeObject?.labelSingular ?? "record")
                    : (activeObject?.labelPlural ?? "records")}?
                </h3>
                <p className="mt-2 text-sm text-tertiary">
                  This action cannot be undone. Are you sure you want to delete{" "}
                  {selectedCount === 1
                    ? `this ${(activeObject?.labelSingular ?? "record").toLowerCase()}`
                    : `these ${selectedCount} ${(activeObject?.labelPlural ?? "records").toLowerCase()}`}?
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <Button
                    size="sm"
                    color="secondary"
                    onClick={() => setBulkDeleteConfirm(false)}
                  >
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

// Helper: convert objectName to a URL-safe tab ID
function slugifyTabId(objectName: string): string {
  return objectName;
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
        <Dropdown.Menu
          onAction={(key) => {
            if (key === "edit") onEdit();
            if (key === "delete") onDelete();
          }}
        >
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
