/**
 * Validation functions for Indian-format CRM fields.
 *
 * Each validator returns `null` when the value is valid (or empty/null/undefined,
 * since all fields are optional) and an error message string when invalid.
 */

import type {
  CrmObjectName,
  CrmRecord,
  ValidationError,
  ValidationResult,
} from "./types";

// ---------------------------------------------------------------------------
// Helper: skip validation for empty/null/undefined (all fields are optional)
// ---------------------------------------------------------------------------

function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value === "";
}

// ---------------------------------------------------------------------------
// Individual field validators
// ---------------------------------------------------------------------------

const PHONE_RE = /^\+?91[6-9]\d{9}$/;

export function validatePhone(value: string | null | undefined): string | null {
  if (isEmpty(value)) return null;
  return PHONE_RE.test(value!) ? null : "Invalid Indian phone number";
}

const AADHAAR_RE = /^\d{12}$/;

export function validateAadhaar(value: string | null | undefined): string | null {
  if (isEmpty(value)) return null;
  return AADHAAR_RE.test(value!) ? null : "Aadhaar must be 12 digits";
}

const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

export function validatePan(value: string | null | undefined): string | null {
  if (isEmpty(value)) return null;
  return PAN_RE.test(value!) ? null : "Invalid PAN format";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string | null | undefined): string | null {
  if (isEmpty(value)) return null;
  return EMAIL_RE.test(value!) ? null : "Invalid email";
}

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function validateIfsc(value: string | null | undefined): string | null {
  if (isEmpty(value)) return null;
  return IFSC_RE.test(value!) ? null : "Invalid IFSC code";
}

const PID_RE = /^PID\d+$/;

export function validatePid(value: string | null | undefined): string | null {
  if (isEmpty(value)) return null;
  return PID_RE.test(value!) ? null : "PID format: PID followed by number";
}

const ROOM_ID_RE = /^\d{2}[A-Z]{2}\d$/;

export function validateRoomId(value: string | null | undefined): string | null {
  if (isEmpty(value)) return null;
  return ROOM_ID_RE.test(value!) ? null : "Room ID format: 12BR2";
}

// ---------------------------------------------------------------------------
// Field-to-validator mapping per object type
// ---------------------------------------------------------------------------

interface FieldRule {
  field: string;
  validate: (v: string | null | undefined) => string | null;
}

const VALIDATION_RULES: Record<string, FieldRule[]> = {
  person: [
    { field: "phone", validate: validatePhone },
    { field: "aadharNumber", validate: validateAadhaar },
    { field: "panCard", validate: validatePan },
    { field: "email", validate: validateEmail },
  ],
  landlord: [
    { field: "panCard", validate: validatePan },
    { field: "ifscCode", validate: validateIfsc },
  ],
  property: [
    { field: "pid", validate: validatePid },
  ],
  room: [
    { field: "roomId", validate: validateRoomId },
  ],
};

// ---------------------------------------------------------------------------
// Record-level validation
// ---------------------------------------------------------------------------

export function validateRecord(
  objectType: CrmObjectName,
  record: CrmRecord,
): ValidationResult {
  const rules = VALIDATION_RULES[objectType] ?? [];
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = (record as Record<string, unknown>)[rule.field];
    const message = rule.validate(value as string | null | undefined);
    if (message !== null) {
      errors.push({
        field: rule.field,
        message,
        value,
      });
    }
  }

  return {
    objectType,
    recordId: record.id,
    errors,
    valid: errors.length === 0,
  };
}
