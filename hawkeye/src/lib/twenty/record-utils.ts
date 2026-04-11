import type { FieldMetadata, RecordData, FullNameValue, EmailsValue, PhonesValue } from "./types";

/** Returns a human-readable title for a record based on available fields */
export function getRecordTitle(record: RecordData, fields: FieldMetadata[]): string {
  // Priority 1: FULL_NAME field
  const fullNameField = fields.find((f) => f.type === "FULL_NAME");
  if (fullNameField) {
    const value = record[fullNameField.name] as FullNameValue | null;
    if (value) {
      const name = [value.firstName, value.lastName].filter(Boolean).join(" ");
      if (name) return name;
    }
  }

  // Priority 2: TEXT field named "name" or "title"
  const namedTextField = fields.find(
    (f) => f.type === "TEXT" && (f.name === "name" || f.name === "title"),
  );
  if (namedTextField) {
    const value = record[namedTextField.name];
    if (value && typeof value === "string" && value.trim()) return value;
  }

  // Priority 3: First TEXT field with a value
  const firstTextField = fields.find((f) => f.type === "TEXT");
  if (firstTextField) {
    const value = record[firstTextField.name];
    if (value && typeof value === "string" && value.trim()) return value;
  }

  // Fallback: record ID
  return record.id;
}

/** Returns a subtitle for a record (email or phone) */
export function getRecordSubtitle(record: RecordData, fields: FieldMetadata[]): string | null {
  // Try EMAILS field
  const emailField = fields.find((f) => f.type === "EMAILS");
  if (emailField) {
    const value = record[emailField.name] as EmailsValue | null;
    if (value?.primaryEmail) return value.primaryEmail;
  }

  // Try PHONES field
  const phoneField = fields.find((f) => f.type === "PHONES");
  if (phoneField) {
    const value = record[phoneField.name] as PhonesValue | null;
    if (value?.primaryPhoneNumber) return value.primaryPhoneNumber;
  }

  // Try a secondary TEXT field (different from the title)
  const textFields = fields.filter((f) => f.type === "TEXT");
  if (textFields.length > 1) {
    const value = record[textFields[1].name];
    if (value && typeof value === "string" && value.trim()) return value;
  }

  return null;
}
