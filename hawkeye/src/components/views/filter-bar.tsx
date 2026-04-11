"use client";

import { useState } from "react";
import { FilterLines, Plus, X } from "@untitledui/icons";
import type { FieldMetadata, ObjectMetadata } from "@/lib/twenty/types";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";

export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

interface FilterBarProps {
  object: ObjectMetadata;
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
}

function getFilterableFields(object: ObjectMetadata): FieldMetadata[] {
  return getVisibleFields(object).filter(
    (f) => FIELD_TYPE_REGISTRY[f.type]?.filterable,
  );
}

function buildFilterObject(filters: FilterCondition[]): Record<string, unknown> | undefined {
  if (filters.length === 0) return undefined;

  const conditions: Record<string, unknown>[] = filters
    .filter((f) => f.field && f.operator && f.value)
    .map((f) => ({ [f.field]: { [f.operator]: f.value } }));

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { and: conditions };
}

export { buildFilterObject };

export function FilterBar({ object, filters, onFiltersChange }: FilterBarProps) {
  const filterableFields = getFilterableFields(object);
  const [isExpanded, setIsExpanded] = useState(filters.length > 0);

  const addFilter = () => {
    const firstField = filterableFields[0];
    if (!firstField) return;
    const operators = FIELD_TYPE_REGISTRY[firstField.type].filterOperators;
    onFiltersChange([
      ...filters,
      { field: firstField.name, operator: operators[0] ?? "eq", value: "" },
    ]);
    setIsExpanded(true);
  };

  const removeFilter = (index: number) => {
    const next = filters.filter((_, i) => i !== index);
    onFiltersChange(next);
    if (next.length === 0) setIsExpanded(false);
  };

  const updateFilter = (index: number, patch: Partial<FilterCondition>) => {
    const next = filters.map((f, i) => {
      if (i !== index) return f;
      const updated = { ...f, ...patch };
      // When changing field, reset operator to first available
      if (patch.field && patch.field !== f.field) {
        const fieldMeta = filterableFields.find((ff) => ff.name === patch.field);
        if (fieldMeta) {
          const operators = FIELD_TYPE_REGISTRY[fieldMeta.type].filterOperators;
          updated.operator = operators[0] ?? "eq";
          updated.value = "";
        }
      }
      return updated;
    });
    onFiltersChange(next);
  };

  if (filterableFields.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {!isExpanded && (
        <div className="flex items-center">
          <Button
            size="sm"
            color="secondary"
            iconLeading={FilterLines}
            onClick={addFilter}
          >
            Filter
          </Button>
        </div>
      )}

      {isExpanded && (
        <div className="flex flex-col gap-2">
          {filters.map((filter, index) => {
            const fieldMeta = filterableFields.find((f) => f.name === filter.field);
            const operators = fieldMeta
              ? FIELD_TYPE_REGISTRY[fieldMeta.type].filterOperators
              : ["eq"];

            return (
              <div key={index} className="flex flex-wrap items-end gap-2">
                <div className="w-full min-w-[120px] md:w-40">
                  <Select
                    aria-label="Field"
                    selectedKey={filter.field}
                    onSelectionChange={(key) =>
                      updateFilter(index, { field: String(key) })
                    }
                    size="sm"
                  >
                    {filterableFields.map((f) => (
                      <Select.Item key={f.name} id={f.name}>
                        {f.label}
                      </Select.Item>
                    ))}
                  </Select>
                </div>

                <div className="w-[calc(50%-0.5rem)] min-w-[100px] md:w-32">
                  <Select
                    aria-label="Operator"
                    selectedKey={filter.operator}
                    onSelectionChange={(key) =>
                      updateFilter(index, { operator: String(key) })
                    }
                    size="sm"
                  >
                    {operators.map((op) => (
                      <Select.Item key={op} id={op}>
                        {op}
                      </Select.Item>
                    ))}
                  </Select>
                </div>

                <div className="flex-1 min-w-[120px] md:w-48 md:flex-initial">
                  <Input
                    aria-label="Value"
                    placeholder="Value..."
                    size="sm"
                    value={filter.value}
                    onChange={(v) => updateFilter(index, { value: v })}
                  />
                </div>

                <Button
                  size="sm"
                  color="tertiary"
                  iconLeading={X}
                  onClick={() => removeFilter(index)}
                  aria-label="Remove filter"
                />
              </div>
            );
          })}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="link-color"
              iconLeading={Plus}
              onClick={addFilter}
            >
              Add filter
            </Button>
            {filters.length > 0 && (
              <Button
                size="sm"
                color="link-gray"
                onClick={() => {
                  onFiltersChange([]);
                  setIsExpanded(false);
                }}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
