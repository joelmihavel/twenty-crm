"use client";

import { useMemo, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { ObjectMetadata, RecordData, FieldMetadata, SelectOption } from "@/lib/twenty/types";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { getRecordTitle, getRecordSubtitle } from "@/lib/twenty/record-utils";
import { useUpdateRecord } from "@/lib/hooks/use-update-record";
import { Badge } from "@/components/base/badges/badges";
import { Select } from "@/components/base/select/select";
import { mapOptionColor } from "@/lib/twenty/color-utils";
import { cx } from "@/utils/cx";

interface KanbanViewProps {
  object: ObjectMetadata;
  records: RecordData[];
  onRecordClick: (record: RecordData) => void;
  onRecordUpdated: () => void;
}

export function KanbanView({ object, records, onRecordClick, onRecordUpdated }: KanbanViewProps) {
  const visibleFields = useMemo(() => getVisibleFields(object), [object]);

  // Find all SELECT fields
  const selectFields = useMemo(
    () => object.fields.filter((f) => f.type === "SELECT" && f.options && f.options.length > 0),
    [object],
  );

  // State for which field drives the columns
  const [selectedFieldName, setSelectedFieldName] = useState<string>(
    selectFields[0]?.name ?? "",
  );

  const activeField = useMemo(
    () => selectFields.find((f) => f.name === selectedFieldName) ?? selectFields[0] ?? null,
    [selectFields, selectedFieldName],
  );

  const { updateRecord } = useUpdateRecord(object);

  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // Group records by the active field's value
  const { columnMap, uncategorized } = useMemo(() => {
    if (!activeField || !activeField.options) {
      return { columnMap: new Map<string, RecordData[]>(), uncategorized: records };
    }

    const map = new Map<string, RecordData[]>();
    for (const option of activeField.options) {
      map.set(option.value, []);
    }

    const uncat: RecordData[] = [];

    for (const record of records) {
      const value = record[activeField.name];
      const strValue = value != null ? String(value) : null;

      if (strValue && map.has(strValue)) {
        map.get(strValue)!.push(record);
      } else {
        uncat.push(record);
      }
    }

    return { columnMap: map, uncategorized: uncat };
  }, [activeField, records]);

  const activeRecord = useMemo(
    () => (activeId ? records.find((r) => r.id === activeId) ?? null : null),
    [activeId, records],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over || !activeField) return;

      const recordId = String(active.id);
      // The droppable container ID is the column value
      const targetColumn = String(over.id);

      // Find the record
      const record = records.find((r) => r.id === recordId);
      if (!record) return;

      const currentValue = record[activeField.name] != null ? String(record[activeField.name]) : null;

      // If dropped on same column, nothing to do
      if (currentValue === targetColumn) return;

      // Check if target column is a valid option value
      const isValidOption = activeField.options?.some((o) => o.value === targetColumn);
      if (!isValidOption) return;

      const success = await updateRecord(recordId, { [activeField.name]: targetColumn });
      if (success) {
        onRecordUpdated();
      }
    },
    [activeField, records, updateRecord, onRecordUpdated],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  if (!activeField) {
    return (
      <div className="flex items-center justify-center p-8 text-tertiary">
        No SELECT fields available for kanban view.
      </div>
    );
  }

  const sortedOptions = [...(activeField.options ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  // Build items for the field selector dropdown
  const fieldSelectorItems = selectFields.map((f) => ({
    id: f.name,
    label: f.label,
  }));

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Field selector */}
      {selectFields.length > 1 && (
        <div className="flex items-center gap-2 px-4 pt-3">
          <span className="text-sm font-medium text-secondary">Group by:</span>
          <Select
            size="sm"
            placeholder="Select field"
            items={fieldSelectorItems}
            selectedKey={selectedFieldName}
            onSelectionChange={(key) => {
              if (key) setSelectedFieldName(String(key));
            }}
          >
            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
          </Select>
        </div>
      )}

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto h-full px-4 pb-4">
          {sortedOptions.map((option) => {
            const columnRecords = columnMap.get(option.value) ?? [];
            return (
              <KanbanColumn
                key={option.value}
                option={option}
                records={columnRecords}
                visibleFields={visibleFields}
                onRecordClick={onRecordClick}
              />
            );
          })}

          {/* Uncategorized column */}
          {uncategorized.length > 0 && (
            <KanbanColumn
              option={{ id: "__uncategorized", value: "__uncategorized", label: "Uncategorized", color: "gray", position: 9999 }}
              records={uncategorized}
              visibleFields={visibleFields}
              onRecordClick={onRecordClick}
              isUncategorized
            />
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeRecord ? (
            <KanbanCardContent
              record={activeRecord}
              visibleFields={visibleFields}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Kanban column
interface KanbanColumnProps {
  option: SelectOption;
  records: RecordData[];
  visibleFields: FieldMetadata[];
  onRecordClick: (record: RecordData) => void;
  isUncategorized?: boolean;
}

function KanbanColumn({ option, records, visibleFields, onRecordClick, isUncategorized }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: option.value,
  });

  const recordIds = useMemo(() => records.map((r) => r.id), [records]);

  return (
    <div
      ref={setNodeRef}
      className={cx(
        "flex flex-col gap-2 min-w-64 w-72 shrink-0 rounded-xl bg-secondary p-3",
        isOver && "ring-2 ring-brand",
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
          {!isUncategorized ? (
            <Badge size="sm" color={mapOptionColor(option.color)}>
              {option.label}
            </Badge>
          ) : (
            <Badge size="sm" color="gray">Uncategorized</Badge>
          )}
        </div>
        <span className="text-xs font-medium text-quaternary tabular-nums">
          {records.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={recordIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-16">
          {records.map((record) => (
            <KanbanCard
              key={record.id}
              record={record}
              visibleFields={visibleFields}
              onClick={() => onRecordClick(record)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// Sortable kanban card
interface KanbanCardProps {
  record: RecordData;
  visibleFields: FieldMetadata[];
  onClick: () => void;
}

function KanbanCard({ record, visibleFields, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: record.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cx(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          // Only fire click if not dragging
          if (!isDragging) {
            e.stopPropagation();
            onClick();
          }
        }}
        className="w-full text-left"
      >
        <KanbanCardContent record={record} visibleFields={visibleFields} />
      </button>
    </div>
  );
}

// Card content (used both in-place and in DragOverlay)
interface KanbanCardContentProps {
  record: RecordData;
  visibleFields: FieldMetadata[];
  isDragOverlay?: boolean;
}

function KanbanCardContent({ record, visibleFields, isDragOverlay }: KanbanCardContentProps) {
  const title = getRecordTitle(record, visibleFields);
  const subtitle = getRecordSubtitle(record, visibleFields);

  return (
    <div
      className={cx(
        "rounded-lg bg-primary p-3 shadow-xs ring-1 ring-secondary transition duration-100 ease-linear hover:shadow-md",
        isDragOverlay && "shadow-lg ring-brand rotate-2",
      )}
    >
      <p className="text-sm font-medium text-primary truncate">{title}</p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-tertiary truncate">{subtitle}</p>
      )}
    </div>
  );
}
