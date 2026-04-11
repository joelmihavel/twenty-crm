import type { FieldMetadata, FieldValidationError, EmailsValue, PhonesValue } from "./types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

// Check if a field value is effectively empty
function isFieldEmpty(value: unknown, fieldType: string): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;

  switch (fieldType) {
    case "FULL_NAME": {
      const fn = value as { firstName?: string; lastName?: string };
      return !fn.firstName?.trim() && !fn.lastName?.trim();
    }
    case "EMAILS": {
      const em = value as EmailsValue;
      return !em.primaryEmail?.trim();
    }
    case "PHONES": {
      const ph = value as PhonesValue;
      return !ph.primaryPhoneNumber?.trim();
    }
    case "CURRENCY": {
      const cv = value as { amountMicros?: number };
      return cv.amountMicros === null || cv.amountMicros === undefined;
    }
    default:
      return false;
  }
}

// Validate a single field and return an error message or null
export function validateField(
  field: FieldMetadata,
  value: unknown,
  isRequired: boolean,
): string | null {
  // Required check
  if (isRequired && isFieldEmpty(value, field.type)) {
    return `${field.label} is required`;
  }

  // Skip further checks if empty and not required
  if (isFieldEmpty(value, field.type)) return null;

  // Type-specific validation
  switch (field.type) {
    case "EMAILS": {
      const em = value as EmailsValue;
      if (em.primaryEmail && !EMAIL_REGEX.test(em.primaryEmail)) {
        return "Please enter a valid email address";
      }
      break;
    }
    case "PHONES": {
      const ph = value as PhonesValue;
      if (ph.primaryPhoneNumber && !PHONE_REGEX.test(ph.primaryPhoneNumber)) {
        return "Please enter a valid phone number";
      }
      break;
    }
    case "NUMBER":
    case "NUMERIC": {
      if (value !== null && value !== undefined) {
        const num = Number(value);
        if (isNaN(num)) {
          return "Please enter a valid number";
        }
      }
      break;
    }
    case "CURRENCY": {
      const cv = value as { amountMicros?: number };
      if (cv.amountMicros !== null && cv.amountMicros !== undefined) {
        if (isNaN(cv.amountMicros)) {
          return "Please enter a valid amount";
        }
      }
      break;
    }
  }

  return null;
}

// Validate all fields and return a map of field name to error message
export function validateForm(
  fields: FieldMetadata[],
  formData: Record<string, unknown>,
  requiredFieldNames: Set<string>,
): Map<string, string> {
  const errors = new Map<string, string>();

  for (const field of fields) {
    const isRequired = requiredFieldNames.has(field.name);
    const value = formData[field.name] ?? field.defaultValue ?? null;
    const error = validateField(field, value, isRequired);
    if (error) {
      errors.set(field.name, error);
    }
  }

  return errors;
}

// Determine which fields should be required
// For now, we mark the first text-like field as required (usually "name")
export function getRequiredFieldNames(fields: FieldMetadata[]): Set<string> {
  const required = new Set<string>();

  // If there's a "name" TEXT field, it is required
  const nameField = fields.find(
    (f) => f.type === "TEXT" && (f.name === "name" || f.name === "title"),
  );
  if (nameField) {
    required.add(nameField.name);
  }

  // If there's a FULL_NAME field, it is required
  const fullNameField = fields.find((f) => f.type === "FULL_NAME");
  if (fullNameField) {
    required.add(fullNameField.name);
  }

  // If nothing was marked required and there are text fields, mark the first one
  if (required.size === 0) {
    const firstText = fields.find((f) => f.type === "TEXT");
    if (firstText) {
      required.add(firstText.name);
    }
  }

  return required;
}
