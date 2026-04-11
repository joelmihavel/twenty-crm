"use client";

import type { FieldMetadata, RecordData } from "@/lib/twenty/types";
import { FieldRenderer } from "@/components/fields/field-renderer";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import { getRecordTitle } from "@/lib/twenty/record-utils";
import { ChevronRight } from "@untitledui/icons";

interface RecordCardProps {
  record: RecordData;
  visibleFields: FieldMetadata[];
  onClick: () => void;
}

function getPreviewFields(fields: FieldMetadata[], titleField: FieldMetadata | undefined): FieldMetadata[] {
  // Return up to 3 key fields (excluding the title field)
  return fields
    .filter((f) => {
      if (titleField && f.name === titleField.name) return false;
      if (!FIELD_TYPE_REGISTRY[f.type]?.showInTable) return false;
      return true;
    })
    .slice(0, 3);
}

export function RecordCard({ record, visibleFields, onClick }: RecordCardProps) {
  const titleField = visibleFields.find((f) => f.type === "FULL_NAME") ?? visibleFields.find((f) => f.type === "TEXT");
  const title = getRecordTitle(record, visibleFields);
  const previewFields = getPreviewFields(visibleFields, titleField);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-secondary bg-primary p-4 text-left transition duration-100 ease-linear hover:bg-primary_hover hover:border-primary active:bg-secondary_hover min-h-[44px]"
    >
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {/* Title */}
        <h3 className="text-sm font-semibold text-primary truncate">
          {title}
        </h3>

        {/* Preview fields */}
        {previewFields.length > 0 && (
          <div className="flex flex-col gap-1">
            {previewFields.map((field) => (
              <div key={field.id} className="flex items-center gap-2 text-xs">
                <span className="text-quaternary font-medium shrink-0">
                  {field.label}:
                </span>
                <span className="text-tertiary truncate">
                  <FieldRenderer field={field} value={record[field.name]} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChevronRight className="size-4 shrink-0 text-fg-quaternary ml-3" />
    </button>
  );
}
