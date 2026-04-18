import type { FieldMetadata, ObjectMetadata, RecordData } from "./types";
import { SYSTEM_FIELD_TYPES, SYSTEM_FIELD_NAMES } from "./types";

// Smart importance scores for field types (higher = more important)
const FIELD_TYPE_SCORES: Record<string, number> = {
  FULL_NAME: 100,
  EMAILS: 90,
  PHONES: 85,
  SELECT: 70,
  MULTI_SELECT: 65,
  CURRENCY: 60,
  NUMBER: 50,
  NUMERIC: 50,
  DATE: 40,
  DATE_TIME: 40,
  BOOLEAN: 30,
  TEXT: 20,
  RATING: 15,
  LINKS: 10,
  ADDRESS: 5,
};

/** Maximum number of columns to display in the desktop table */
export const MAX_TABLE_COLUMNS = 7;

/** Score a field by its importance for table display */
export function scoreField(field: FieldMetadata): number {
  // TEXT fields named "name" or "title" get elevated priority
  if (
    field.type === "TEXT" &&
    /^(name|title)$/i.test(field.name)
  ) {
    return 95;
  }

  return FIELD_TYPE_SCORES[field.type] ?? 5;
}

/** Get user-visible fields (exclude system/internal), sorted by importance score descending */
export function getVisibleFields(object: ObjectMetadata): FieldMetadata[] {
  return object.fields
    .filter(
      (f) =>
        !SYSTEM_FIELD_TYPES.includes(f.type) &&
        !SYSTEM_FIELD_NAMES.includes(f.name) &&
        f.type !== "RELATION" &&
        f.type !== "MORPH_RELATION",
    )
    .sort((a, b) => {
      const aScore = scoreField(a);
      const bScore = scoreField(b);
      if (aScore !== bScore) return bScore - aScore;

      // Tie-break: alphabetical by label
      return a.label.localeCompare(b.label);
    });
}

/**
 * Filter out fields where ALL records in the current page have null/empty values.
 * This removes "dashboard of dashes" columns from the table.
 */
export function filterPopulatedFields(
  fields: FieldMetadata[],
  records: RecordData[],
): FieldMetadata[] {
  if (records.length === 0) return fields;

  return fields.filter((field) => {
    return records.some((record) => {
      const val = record[field.name];
      if (val === null || val === undefined || val === "") return false;
      if (typeof val === "object" && val !== null) {
        return !Object.values(val as Record<string, unknown>).every(
          (v) => v === null || v === undefined || v === "",
        );
      }
      return true;
    });
  });
}

/** Build the field selection fragment for a GraphQL query */
function buildFieldSelection(field: FieldMetadata): string {
  switch (field.type) {
    case "FULL_NAME":
      return `${field.name} { firstName lastName }`;
    case "EMAILS":
      return `${field.name} { primaryEmail }`;
    case "PHONES":
      return `${field.name} { primaryPhoneNumber }`;
    case "CURRENCY":
      return `${field.name} { amountMicros currencyCode }`;
    case "LINKS":
      return `${field.name} { primaryLinkUrl primaryLinkLabel }`;
    case "ADDRESS":
      return `${field.name} { addressStreet1 addressStreet2 addressCity addressState addressCountry addressPostcode }`;
    default:
      return field.name;
  }
}

/** Build a query to fetch records for an object */
export function buildListQuery(
  object: ObjectMetadata,
  options: {
    first?: number;
    after?: string;
    filter?: Record<string, unknown>;
    orderBy?: { field: string; direction: "AscNullsFirst" | "DescNullsFirst" };
  } = {},
): string {
  const fields = getVisibleFields(object);
  const selections = ["id", ...fields.map(buildFieldSelection)].join("\n    ");

  const args: string[] = [];
  if (options.first) args.push(`first: ${options.first}`);
  if (options.after) args.push(`after: "${options.after}"`);
  if (options.filter) args.push(`filter: ${JSON.stringify(options.filter).replace(/"([^"]+)":/g, "$1:")}`);
  if (options.orderBy) {
    args.push(`orderBy: { ${options.orderBy.field}: ${options.orderBy.direction} }`);
  }

  const argsStr = args.length > 0 ? `(${args.join(", ")})` : "(first: 50)";

  return `{
    ${object.namePlural}${argsStr} {
      edges {
        node {
          ${selections}
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }`;
}

/** Build a mutation to create a record */
export function buildCreateMutation(object: ObjectMetadata): string {
  const typeName = capitalize(object.nameSingular);
  return `mutation Create${typeName}($data: ${typeName}CreateInput!) {
    create${typeName}(data: $data) {
      id
    }
  }`;
}

/** Build a mutation to update a record */
export function buildUpdateMutation(object: ObjectMetadata): string {
  const typeName = capitalize(object.nameSingular);
  return `mutation Update${typeName}($id: ID!, $data: ${typeName}UpdateInput!) {
    update${typeName}(id: $id, data: $data) {
      id
    }
  }`;
}

/** Build a mutation to delete a record */
export function buildDeleteMutation(object: ObjectMetadata): string {
  const typeName = capitalize(object.nameSingular);
  return `mutation Delete${typeName}($id: ID!) {
    delete${typeName}(id: $id) {
      id
    }
  }`;
}

/** Build a mutation to bulk-delete records by filter */
export function buildBulkDeleteMutation(object: ObjectMetadata): string {
  const typeName = capitalize(object.nameSingular);
  const typePlural = capitalize(object.namePlural);
  return `mutation Delete${typePlural}($filter: ${typeName}FilterInput!) {
    delete${typePlural}(filter: $filter) {
      id
    }
  }`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
