"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ArrowLeft, File06, Activity, Edit05 } from "@untitledui/icons";
import type { ObjectMetadata, RecordData } from "@/lib/twenty/types";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import { useUpdateRecord } from "@/lib/hooks/use-update-record";
import { useToast } from "@/lib/hooks/use-toast";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { getRecordTitle, getRecordSubtitle } from "@/lib/twenty/record-utils";
import { groupFields } from "@/lib/twenty/field-groups";
import { FieldEditor } from "@/components/fields/field-editor";
import { FieldRenderer } from "@/components/fields/field-renderer";
import { NotesPanel } from "@/components/views/notes-panel";
import { ActivityPanel } from "@/components/views/activity-panel";
import { Button } from "@/components/base/buttons/button";
import { Tabs } from "@/components/application/tabs/tabs";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";

// Object names considered "people" objects — they have name + contact info
const PEOPLE_OBJECTS = new Set(["tenant", "merchant", "vendor"]);

/** Extract initials from a record title (e.g. "Olivia Rhye" -> "OR") */
function getInitials(title: string): string {
  const parts = title.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return title.slice(0, 2).toUpperCase();
}

/** Find the first SELECT field value that can be used as a status badge */
function getStatusBadge(
  record: RecordData,
  fields: import("@/lib/twenty/types").FieldMetadata[],
): { label: string; color: string } | null {
  for (const field of fields) {
    if (field.type === "SELECT" && field.options && field.options.length > 0) {
      const value = record[field.name] as string | null;
      if (value) {
        const option = field.options.find((o) => o.value === value);
        if (option) {
          return { label: option.label, color: option.color };
        }
      }
    }
  }
  return null;
}

/** Map Twenty color codes to Badge component color props */
function mapBadgeColor(
  color: string,
): "gray" | "brand" | "error" | "warning" | "success" | "blue" | "purple" | "orange" | "pink" | "sky" | "indigo" | "slate" {
  const colorLower = color.toLowerCase();
  if (colorLower.includes("green")) return "success";
  if (colorLower.includes("red")) return "error";
  if (colorLower.includes("yellow") || colorLower.includes("orange")) return "warning";
  if (colorLower.includes("blue")) return "blue";
  if (colorLower.includes("purple") || colorLower.includes("violet")) return "purple";
  if (colorLower.includes("pink")) return "pink";
  if (colorLower.includes("sky") || colorLower.includes("turquoise") || colorLower.includes("aqua")) return "sky";
  return "gray";
}

interface RecordDetailProps {
  object: ObjectMetadata;
  record: RecordData;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function RecordDetail({ object, record, isOpen, onClose, onUpdated }: RecordDetailProps) {
  const visibleFields = useMemo(() => getVisibleFields(object), [object]);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isEditing, setIsEditing] = useState(false);
  const { updateRecord, loading, error } = useUpdateRecord(object);
  const { toast } = useToast();
  const isDesktop = useBreakpoint("md");

  // Compute field groups for structured rendering
  const fieldGroups = useMemo(() => groupFields(visibleFields), [visibleFields]);

  // Hero section data
  const isPeopleObject = PEOPLE_OBJECTS.has(object.nameSingular);
  const recordTitle = useMemo(
    () => getRecordTitle(record, visibleFields),
    [record, visibleFields],
  );
  const recordSubtitle = useMemo(
    () => getRecordSubtitle(record, visibleFields),
    [record, visibleFields],
  );
  const statusBadge = useMemo(
    () => getStatusBadge(record, visibleFields),
    [record, visibleFields],
  );

  // Reset form data when record changes
  useEffect(() => {
    if (record) {
      const data: Record<string, unknown> = {};
      visibleFields.forEach((f) => {
        data[f.name] = record[f.name];
      });
      setFormData(data);
      setIsEditing(false);
    }
  }, [record?.id, visibleFields]);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async () => {
    // Only send changed fields
    const changes: Record<string, unknown> = {};
    visibleFields.forEach((f) => {
      if (FIELD_TYPE_REGISTRY[f.type]?.inlineEditable) {
        const current = formData[f.name];
        const original = record[f.name];
        if (JSON.stringify(current) !== JSON.stringify(original)) {
          changes[f.name] = current;
        }
      }
    });

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      return;
    }

    const success = await updateRecord(record.id, changes);
    if (success) {
      toast(`${object.labelSingular} updated successfully`, "success");
      setIsEditing(false);
      onUpdated();
    } else {
      toast(`Failed to update ${object.labelSingular.toLowerCase()}`, "error");
    }
  };

  const handleCancel = () => {
    // Reset to original values
    const data: Record<string, unknown> = {};
    visibleFields.forEach((f) => {
      data[f.name] = record[f.name];
    });
    setFormData(data);
    setIsEditing(false);
  };

  // Focus trap for slideout panel
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Trap Tab focus within the panel
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  if (!isOpen || !record) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${object.labelSingular} details`}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cx(
        "fixed z-40 flex flex-col bg-primary shadow-xl outline-none",
        // Mobile: full screen
        "inset-0",
        // Desktop: slideout from right
        "md:inset-y-0 md:right-0 md:left-auto md:w-full md:max-w-md md:border-l md:border-secondary",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-secondary px-4 py-3 md:px-6 md:py-4 shrink-0">
        {/* Mobile: back button */}
        <div className="md:hidden">
          <Button
            size="sm"
            color="tertiary"
            iconLeading={ArrowLeft}
            onClick={onClose}
            aria-label="Go back"
          />
        </div>

        {/* Hero section */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isPeopleObject ? (
            <AvatarLabelGroup
              size="lg"
              initials={getInitials(recordTitle)}
              title={recordTitle}
              subtitle={recordSubtitle ?? object.labelSingular}
            />
          ) : (
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium text-tertiary uppercase tracking-wider">
                {object.labelSingular}
              </span>
              <h2 className="text-base font-semibold text-primary md:text-lg truncate">
                {recordTitle}
              </h2>
            </div>
          )}
          {statusBadge && (
            <Badge
              size="sm"
              color={mapBadgeColor(statusBadge.color)}
              type="pill-color"
            >
              {statusBadge.label}
            </Badge>
          )}
        </div>

        {/* Desktop: close button */}
        <div className="hidden md:block shrink-0">
          <Button
            size="sm"
            color="tertiary"
            iconLeading={X}
            onClick={onClose}
            aria-label="Close panel"
          />
        </div>

        {/* Mobile: edit/placeholder for alignment */}
        <div className="md:hidden shrink-0">
          {!isEditing && (
            <Button
              size="sm"
              color="link-color"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Body with Tabs */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <Tabs defaultSelectedKey="details" className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-secondary px-4 md:px-6 shrink-0">
            <Tabs.List type="underline" size="sm">
              <Tabs.Item id="details" icon={Edit05}>Details</Tabs.Item>
              <Tabs.Item id="notes" icon={File06}>Notes</Tabs.Item>
              <Tabs.Item id="activity" icon={Activity}>Activity</Tabs.Item>
            </Tabs.List>
          </div>

          <Tabs.Panel id="details" className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-6">
              {fieldGroups.map((group) => (
                <div key={group.key} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 pt-2">
                    <group.icon className="size-4 text-fg-quaternary" />
                    <h4 className="text-xs font-semibold text-quaternary uppercase tracking-wider">
                      {group.label}
                    </h4>
                  </div>
                  <div className="flex flex-col gap-4 md:gap-5">
                    {group.fields.map((field) => {
                      const isEditable = FIELD_TYPE_REGISTRY[field.type]?.inlineEditable;

                      if (isEditing && isEditable) {
                        return (
                          <FieldEditor
                            key={field.id}
                            field={field}
                            value={formData[field.name]}
                            onChange={(val) => handleFieldChange(field.name, val)}
                          />
                        );
                      }

                      return (
                        <div key={field.id} className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-quaternary uppercase tracking-wider">
                            {field.label}
                          </span>
                          <div className="text-sm text-secondary">
                            <FieldRenderer field={field} value={record[field.name]} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-sm text-error-primary">
                {error.message}
              </p>
            )}
          </Tabs.Panel>

          <Tabs.Panel id="notes" className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
            <NotesPanel objectName={object.nameSingular} recordId={record.id} />
          </Tabs.Panel>

          <Tabs.Panel id="activity" className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
            <ActivityPanel objectName={object.nameSingular} record={record} />
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* Footer */}
      <div
        className={cx(
          "flex items-center gap-3 border-t border-secondary px-4 py-3 md:px-6 md:py-4 shrink-0",
          // Mobile: sticky at bottom, full width buttons
          "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
          isEditing ? "justify-between md:justify-end" : "justify-end",
        )}
      >
        {isEditing ? (
          <>
            <Button
              size="md"
              color="secondary"
              onClick={handleCancel}
              isDisabled={loading}
              className="flex-1 md:flex-initial"
            >
              Cancel
            </Button>
            <Button
              size="md"
              color="primary"
              onClick={handleSave}
              isLoading={loading}
              showTextWhileLoading
              className="flex-1 md:flex-initial"
            >
              Save
            </Button>
          </>
        ) : (
          <Button
            size="md"
            color="primary"
            onClick={() => setIsEditing(true)}
            className="hidden md:inline-flex"
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
