export interface FieldMetadata {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  isCustom: boolean;
  options: SelectOption[] | null;
  defaultValue: unknown;
  description: string | null;
}

export type FieldType =
  | "TEXT" | "NUMBER" | "NUMERIC" | "BOOLEAN" | "DATE" | "DATE_TIME"
  | "SELECT" | "MULTI_SELECT" | "CURRENCY" | "LINKS" | "RICH_TEXT"
  | "RATING" | "ADDRESS" | "PHONES" | "EMAILS" | "FULL_NAME"
  | "RELATION" | "MORPH_RELATION" | "FILES" | "RAW_JSON"
  | "ACTOR" | "POSITION" | "TS_VECTOR" | "UUID" | "ARRAY";

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  color: string;
  position: number;
}

export interface ObjectMetadata {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  isCustom: boolean;
  isActive: boolean;
  fields: FieldMetadata[];
}

export interface RecordData {
  id: string;
  [key: string]: unknown;
}

export interface CurrencyValue {
  amountMicros: number;
  currencyCode: string;
}

export interface FullNameValue {
  firstName: string;
  lastName: string;
}

export interface EmailsValue {
  primaryEmail: string;
}

export interface PhonesValue {
  primaryPhoneNumber: string;
}

export interface LinksValue {
  primaryLinkUrl: string;
  primaryLinkLabel: string;
}

export interface RelationMetadata {
  relationType: string;
  targetObjectNameSingular: string;
  targetFieldName: string;
}

export interface FieldValidationError {
  field: string;
  message: string;
}

// Fields to exclude from user-facing views (internal/system fields)
export const SYSTEM_FIELD_TYPES: FieldType[] = [
  "ACTOR", "POSITION", "TS_VECTOR", "UUID",
];

export const SYSTEM_FIELD_NAMES = [
  "id", "createdAt", "updatedAt", "deletedAt",
  "createdBy", "updatedBy", "position", "searchVector",
];
