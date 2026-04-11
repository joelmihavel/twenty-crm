"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ArrowLeft, File06, Activity, Edit05 } from "@untitledui/icons";
import type { ObjectMetadata, RecordData } from "@/lib/twenty/types";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import { useUpdateRecord } from "@/lib/hooks/use-update-record";
import { useToast } from "@/lib/hooks/use-toast";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { FieldEditor } from "@/components/fields/field-editor";
import { FieldRenderer } from "@/components/fields/field-renderer";
import { NotesPanel } from "@/components/views/notes-panel";
import { ActivityPanel } from "@/components/views/activity-panel";
import { Button } from "@/components/base/buttons/button";
import { Tabs } from "@/components/application/tabs/tabs";
import { cx } from "@/utils/cx";

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

  // Reset form data when record changes (Fix 16)
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

  // Focus trap for slideout panel (Fix 26)
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Focus the panel on open
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

        <h2 className="text-base font-semibold text-primary md:text-lg">
          {object.labelSingular} Details
        </h2>

        {/* Desktop: close button */}
        <div className="hidden md:block">
          <Button
            size="sm"
            color="tertiary"
            iconLeading={X}
            onClick={onClose}
            aria-label="Close panel"
          />
        </div>

        {/* Mobile: edit/placeholder for alignment */}
        <div className="md:hidden">
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
            <div className="flex flex-col gap-4 md:gap-5">
              {visibleFields.map((field) => {
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
