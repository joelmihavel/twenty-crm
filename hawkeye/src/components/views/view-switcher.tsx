"use client";

import { List, Columns03, Calendar } from "@untitledui/icons";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import type { Selection } from "react-aria-components";

export type ViewType = "table" | "kanban" | "calendar";

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  hasSelectFields: boolean;
  hasDateFields: boolean;
}

export function ViewSwitcher({
  currentView,
  onViewChange,
  hasSelectFields,
  hasDateFields,
}: ViewSwitcherProps) {
  const handleSelectionChange = (keys: Selection) => {
    if (keys === "all") return;
    const selected = Array.from(keys)[0] as ViewType | undefined;
    if (selected) {
      onViewChange(selected);
    }
  };

  return (
    <ButtonGroup
      size="sm"
      selectionMode="single"
      selectedKeys={new Set([currentView])}
      onSelectionChange={handleSelectionChange}
    >
      <ButtonGroupItem id="table" iconLeading={List} aria-label="Table view" />
      {hasSelectFields && (
        <ButtonGroupItem id="kanban" iconLeading={Columns03} aria-label="Kanban view" />
      )}
      {hasDateFields && (
        <ButtonGroupItem id="calendar" iconLeading={Calendar} aria-label="Calendar view" />
      )}
    </ButtonGroup>
  );
}
