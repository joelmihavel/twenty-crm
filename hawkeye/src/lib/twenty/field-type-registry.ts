import type { FieldType } from "./types";

export interface FieldTypeConfig {
  /** Human-readable name */
  label: string;
  /** Can this field be displayed in a table column? */
  showInTable: boolean;
  /** Can this field be used as a filter? */
  filterable: boolean;
  /** Can this field be sorted? */
  sortable: boolean;
  /** Can this field be edited inline? */
  inlineEditable: boolean;
  /** Filter operators available */
  filterOperators: string[];
}

export const FIELD_TYPE_REGISTRY: Record<FieldType, FieldTypeConfig> = {
  TEXT: { label: "Text", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq", "neq", "contains", "startsWith"] },
  NUMBER: { label: "Number", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq", "neq", "gt", "gte", "lt", "lte"] },
  NUMERIC: { label: "Numeric", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq", "neq", "gt", "gte", "lt", "lte"] },
  BOOLEAN: { label: "Boolean", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq"] },
  DATE: { label: "Date", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq", "gt", "lt", "gte", "lte"] },
  DATE_TIME: { label: "Date & Time", showInTable: true, filterable: true, sortable: true, inlineEditable: false, filterOperators: ["eq", "gt", "lt"] },
  SELECT: { label: "Select", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq", "neq", "in"] },
  MULTI_SELECT: { label: "Multi Select", showInTable: true, filterable: true, sortable: false, inlineEditable: true, filterOperators: ["contains"] },
  CURRENCY: { label: "Currency", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq", "gt", "lt", "gte", "lte"] },
  LINKS: { label: "Links", showInTable: true, filterable: false, sortable: false, inlineEditable: true, filterOperators: [] },
  RICH_TEXT: { label: "Rich Text", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  RATING: { label: "Rating", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["eq", "gt", "lt"] },
  ADDRESS: { label: "Address", showInTable: true, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  PHONES: { label: "Phones", showInTable: true, filterable: true, sortable: false, inlineEditable: true, filterOperators: ["contains"] },
  EMAILS: { label: "Emails", showInTable: true, filterable: true, sortable: false, inlineEditable: true, filterOperators: ["contains"] },
  FULL_NAME: { label: "Full Name", showInTable: true, filterable: true, sortable: true, inlineEditable: true, filterOperators: ["contains"] },
  RELATION: { label: "Relation", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  MORPH_RELATION: { label: "Morph Relation", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  FILES: { label: "Files", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  RAW_JSON: { label: "JSON", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  ACTOR: { label: "Actor", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  POSITION: { label: "Position", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  TS_VECTOR: { label: "Search", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  UUID: { label: "UUID", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
  ARRAY: { label: "Array", showInTable: false, filterable: false, sortable: false, inlineEditable: false, filterOperators: [] },
};
