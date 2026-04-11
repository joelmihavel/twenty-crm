"use client";

import { useCallback, useMemo, useState } from "react";
import type { ObjectMetadata } from "@/lib/twenty/types";
import { getVisibleFields } from "@/lib/twenty/query-builder";
import { FIELD_TYPE_REGISTRY } from "@/lib/twenty/field-type-registry";
import { validateForm, getRequiredFieldNames } from "@/lib/twenty/form-validation";
import { useCreateRecord } from "@/lib/hooks/use-create-record";
import { useToast } from "@/lib/hooks/use-toast";
import { FieldEditor } from "@/components/fields/field-editor";
import { Button } from "@/components/base/buttons/button";
import { Form } from "@/components/base/form/form";
import { DialogTrigger, ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";

interface CreateRecordModalProps {
  object: ObjectMetadata;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRecordModal({ object, isOpen, onClose, onCreated }: CreateRecordModalProps) {
  const editableFields = useMemo(
    () =>
      getVisibleFields(object).filter(
        (f) => FIELD_TYPE_REGISTRY[f.type]?.inlineEditable,
      ),
    [object],
  );

  const requiredFieldNames = useMemo(
    () => getRequiredFieldNames(editableFields),
    [editableFields],
  );

  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map());
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { createRecord, loading, error } = useCreateRecord(object);
  const { toast } = useToast();

  const handleFieldChange = useCallback((fieldName: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [fieldName]: value };

      // Re-validate this field immediately if user has already submitted once
      if (hasSubmitted) {
        const field = editableFields.find((f) => f.name === fieldName);
        if (field) {
          const errors = validateForm([field], next, requiredFieldNames);
          setFieldErrors((prevErrors) => {
            const newErrors = new Map(prevErrors);
            if (errors.has(fieldName)) {
              newErrors.set(fieldName, errors.get(fieldName)!);
            } else {
              newErrors.delete(fieldName);
            }
            return newErrors;
          });
        }
      }

      return next;
    });
  }, [hasSubmitted, editableFields, requiredFieldNames]);

  const isFormValid = useMemo(() => {
    if (!hasSubmitted) return true;
    return fieldErrors.size === 0;
  }, [hasSubmitted, fieldErrors]);

  const handleSubmit = useCallback(async () => {
    setHasSubmitted(true);

    // Validate all fields
    const errors = validateForm(editableFields, formData, requiredFieldNames);
    setFieldErrors(errors);

    if (errors.size > 0) {
      return;
    }

    const id = await createRecord(formData);
    if (id) {
      toast(`${object.labelSingular} created successfully`, "success");
      setFormData({});
      setFieldErrors(new Map());
      setHasSubmitted(false);
      onCreated();
      onClose();
    } else {
      toast(`Failed to create ${object.labelSingular.toLowerCase()}`, "error");
    }
  }, [editableFields, formData, requiredFieldNames, createRecord, object, toast, onCreated, onClose]);

  const handleClose = useCallback(() => {
    setFormData({});
    setFieldErrors(new Map());
    setHasSubmitted(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <ModalOverlay>
        <Modal className="max-w-lg">
          <Dialog>
            <div className="w-full rounded-xl bg-primary shadow-xl ring-1 ring-secondary">
              <div className="border-b border-secondary px-6 py-5">
                <h2 className="text-lg font-semibold text-primary">
                  New {object.labelSingular}
                </h2>
                <p className="mt-1 text-sm text-tertiary">
                  Fill in the fields below to create a new {object.labelSingular.toLowerCase()}.
                </p>
              </div>

              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="max-h-96 overflow-y-auto px-6 py-5">
                  <div className="flex flex-col gap-4">
                    {editableFields.map((field) => (
                      <div key={field.id} className="flex flex-col gap-1">
                        {requiredFieldNames.has(field.name) && (
                          <div className="sr-only">Required</div>
                        )}
                        <FieldEditor
                          field={field}
                          value={formData[field.name] ?? field.defaultValue ?? null}
                          onChange={(val) => handleFieldChange(field.name, val)}
                          error={fieldErrors.get(field.name) ?? null}
                        />
                      </div>
                    ))}
                  </div>

                  {error && (
                    <p className="mt-4 text-sm text-error-primary">
                      {error.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-secondary px-6 py-4">
                  <Button
                    size="md"
                    color="secondary"
                    onClick={handleClose}
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="md"
                    color="primary"
                    type="submit"
                    isLoading={loading}
                    isDisabled={hasSubmitted && !isFormValid}
                    showTextWhileLoading
                  >
                    Create {object.labelSingular}
                  </Button>
                </div>
              </Form>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
