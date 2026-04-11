import type { FC } from "react";
import {
  User01,
  CreditCard02,
  BarChart01,
  Calendar,
  Key01,
  Heart,
  File06,
} from "@untitledui/icons";
import type { FieldMetadata } from "./types";

export interface FieldGroup {
  key: string;
  label: string;
  icon: FC<{ className?: string }>;
  fields: FieldMetadata[];
}

// Patterns used to categorize fields by name
const CONTACT_PATTERNS = /^(email|phone|name|address|linkedin|twitter|instagram)/i;
const FINANCIAL_PATTERNS = /^(rent|fee|amount|deposit|payment|price|cost|gst|tds|monthly|license)/i;
const IDENTITY_PATTERNS = /^(pan|aadhaar|gst|uid|contract_id)/i;
const PREFERENCE_PATTERNS = /^(preference|food|smoking|pet|gender)/i;

// Group definition order determines render order
const GROUP_DEFINITIONS: {
  key: string;
  label: string;
  icon: FC<{ className?: string }>;
  match: (field: FieldMetadata) => boolean;
}[] = [
  {
    key: "contact",
    label: "Contact",
    icon: User01,
    match: (f) =>
      CONTACT_PATTERNS.test(f.name) ||
      f.type === "FULL_NAME" ||
      f.type === "EMAILS" ||
      f.type === "PHONES",
  },
  {
    key: "financial",
    label: "Financial",
    icon: CreditCard02,
    match: (f) => FINANCIAL_PATTERNS.test(f.name) || f.type === "CURRENCY",
  },
  {
    key: "status",
    label: "Status",
    icon: BarChart01,
    match: (f) => f.type === "SELECT" || f.type === "BOOLEAN",
  },
  {
    key: "dates",
    label: "Dates",
    icon: Calendar,
    match: (f) => f.type === "DATE" || f.type === "DATE_TIME",
  },
  {
    key: "identity",
    label: "Identity",
    icon: Key01,
    match: (f) => IDENTITY_PATTERNS.test(f.name),
  },
  {
    key: "preferences",
    label: "Preferences",
    icon: Heart,
    match: (f) => PREFERENCE_PATTERNS.test(f.name),
  },
];

/**
 * Groups fields into categorized sections based on field name patterns and types.
 * Returns only groups that have at least one field, in a stable order.
 * Fields that don't match any category are placed into an "Other" group.
 */
export function groupFields(fields: FieldMetadata[]): FieldGroup[] {
  const assigned = new Set<string>();
  const groups: Map<string, FieldGroup> = new Map();

  // Initialize groups in order
  for (const def of GROUP_DEFINITIONS) {
    groups.set(def.key, {
      key: def.key,
      label: def.label,
      icon: def.icon,
      fields: [],
    });
  }

  // Assign fields to the first matching group
  for (const field of fields) {
    for (const def of GROUP_DEFINITIONS) {
      if (def.match(field)) {
        groups.get(def.key)!.fields.push(field);
        assigned.add(field.id);
        break;
      }
    }
  }

  // Collect unassigned fields into "Other"
  const otherFields = fields.filter((f) => !assigned.has(f.id));

  // Build result: only groups that have fields, in definition order
  const result: FieldGroup[] = [];

  for (const def of GROUP_DEFINITIONS) {
    const group = groups.get(def.key)!;
    if (group.fields.length > 0) {
      result.push(group);
    }
  }

  if (otherFields.length > 0) {
    result.push({
      key: "other",
      label: "Other",
      icon: File06,
      fields: otherFields,
    });
  }

  return result;
}
