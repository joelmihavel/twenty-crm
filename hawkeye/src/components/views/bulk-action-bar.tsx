"use client";

import { Trash01, Download01, X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  onClear: () => void;
  isDeleting?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onDelete,
  onExport,
  onClear,
  isDeleting = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={
        "fixed bottom-4 left-1/2 z-40 -translate-x-1/2 " +
        "flex items-center gap-3 rounded-xl bg-primary px-4 py-3 " +
        "shadow-lg ring-1 ring-secondary " +
        "transition-all duration-200 ease-out " +
        "md:bottom-6 " +
        // Push above the mobile bottom nav (which is ~64px tall)
        "max-md:bottom-20"
      }
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="text-sm font-medium text-primary whitespace-nowrap">
        {selectedCount} selected
      </span>

      <div className="h-4 w-px bg-tertiary" aria-hidden="true" />

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          color="primary-destructive"
          iconLeading={Trash01}
          onClick={onDelete}
          isLoading={isDeleting}
          showTextWhileLoading
        >
          Delete
        </Button>

        <Button
          size="sm"
          color="secondary"
          iconLeading={Download01}
          onClick={onExport}
        >
          Export
        </Button>

        <Button
          size="sm"
          color="tertiary"
          iconLeading={X}
          onClick={onClear}
          aria-label="Clear selection"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
