/**
 * Idempotent wrapper for Twenty's metadata GraphQL API.
 * All mutations check for existing resources before creating.
 */

import type {
  FieldDefinition,
  ObjectMetadata,
  SelectOption,
  RelationDefinition,
} from "./types.js";

const METADATA_URL = process.env.TWENTY_METADATA_URL ?? "http://localhost:3000/metadata";
const API_KEY = process.env.TWENTY_API_KEY ?? "";

// ---------- low-level helpers ----------

async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  operationName?: string,
): Promise<T> {
  const body: Record<string, unknown> = { query };
  if (variables) body.variables = variables;
  if (operationName) body.operationName = operationName;

  const res = await fetch(METADATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  if (!json.data) {
    throw new Error("No data in response");
  }

  return json.data;
}

// ---------- escaping ----------

function escapeGraphQLString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function optionsToGQL(options: SelectOption[]): string {
  const items = options.map(
    (o) =>
      `{ id: "${o.id}", label: "${escapeGraphQLString(o.label)}", value: "${escapeGraphQLString(o.value)}", color: "${o.color}", position: ${o.position} }`
  );
  return `[${items.join(", ")}]`;
}

// ---------- queries ----------

export async function listObjects(): Promise<
  Array<{ id: string; nameSingular: string; isCustom: boolean }>
> {
  const data = await gqlRequest<{
    objects: {
      edges: Array<{
        node: { id: string; nameSingular: string; isCustom: boolean };
      }>;
    };
  }>(`{ objects(paging: { first: 200 }) { edges { node { id nameSingular isCustom } } } }`);
  return data.objects.edges.map((e) => e.node);
}

export async function getObjectByName(
  nameSingular: string
): Promise<ObjectMetadata | null> {
  const data = await gqlRequest<{
    objects: {
      edges: Array<{ node: ObjectMetadata }>;
    };
  }>(
    `{ objects(paging: { first: 200 }) { edges { node { id nameSingular isCustom fields { edges { node { id name type isCustom } } } } } } }`
  );
  const match = data.objects.edges.find(
    (e) => e.node.nameSingular === nameSingular
  );
  return match ? match.node : null;
}

export async function getObjectById(
  objectId: string
): Promise<ObjectMetadata | null> {
  try {
    const data = await gqlRequest<{
      object: ObjectMetadata;
    }>(
      `{ object(id: "${objectId}") { id nameSingular isCustom fields(paging: { first: 200 }) { edges { node { id name type isCustom } } } } }`
    );
    return data.object;
  } catch {
    return null;
  }
}

// ---------- create object ----------

export async function createObject(input: {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  description?: string;
}): Promise<{ id: string; created: boolean }> {
  // Check if already exists
  const existing = await getObjectByName(input.nameSingular);
  if (existing) {
    console.log(`  [skip] Object "${input.nameSingular}" already exists (${existing.id})`);
    return { id: existing.id, created: false };
  }

  const descPart = input.description
    ? `, description: "${escapeGraphQLString(input.description)}"`
    : "";

  const mutation = `mutation {
    createOneObject(input: { object: {
      nameSingular: "${input.nameSingular}",
      namePlural: "${input.namePlural}",
      labelSingular: "${input.labelSingular}",
      labelPlural: "${input.labelPlural}",
      icon: "${input.icon}",
      isLabelSyncedWithName: false
      ${descPart}
    } }) {
      id nameSingular isCustom
    }
  }`;

  const data = await gqlRequest<{
    createOneObject: { id: string; nameSingular: string; isCustom: boolean };
  }>(mutation);

  console.log(`  [created] Object "${input.nameSingular}" -> ${data.createOneObject.id}`);
  return { id: data.createOneObject.id, created: true };
}

// ---------- create field ----------

export async function createField(
  objectMetadataId: string,
  objectName: string,
  field: FieldDefinition
): Promise<{ id: string; created: boolean }> {
  // Check if field already exists on the object (use getObjectById for reliable paging)
  const obj = await getObjectById(objectMetadataId);
  if (obj) {
    const existingField = obj.fields.edges.find((e) => e.node.name === field.name);
    if (existingField) {
      console.log(`    [skip] Field "${field.name}" already exists on "${objectName}"`);
      return { id: existingField.node.id, created: false };
    }
  }

  const iconPart = field.icon ? `, icon: "${field.icon}"` : "";
  const descPart = field.description
    ? `, description: "${escapeGraphQLString(field.description)}"`
    : "";

  let optionsPart = "";
  if (
    (field.type === "SELECT" || field.type === "MULTI_SELECT") &&
    field.options &&
    field.options.length > 0
  ) {
    optionsPart = `, options: ${optionsToGQL(field.options)}`;
  }

  let defaultValuePart = "";
  if (field.defaultValue !== undefined) {
    if (typeof field.defaultValue === "string") {
      defaultValuePart = `, defaultValue: "${escapeGraphQLString(field.defaultValue)}"`;
    } else if (typeof field.defaultValue === "number" || typeof field.defaultValue === "boolean") {
      defaultValuePart = `, defaultValue: ${field.defaultValue}`;
    }
  }

  const mutation = `mutation {
    createOneField(input: { field: {
      objectMetadataId: "${objectMetadataId}",
      name: "${field.name}",
      label: "${escapeGraphQLString(field.label)}",
      type: ${field.type},
      isLabelSyncedWithName: false
      ${iconPart}
      ${descPart}
      ${optionsPart}
      ${defaultValuePart}
    } }) {
      id name type
    }
  }`;

  const data = await gqlRequest<{
    createOneField: { id: string; name: string; type: string };
  }>(mutation);

  console.log(`    [created] Field "${field.name}" (${field.type}) on "${objectName}"`);
  return { id: data.createOneField.id, created: true };
}

// ---------- create relation ----------

/**
 * Creates a relation by creating a RELATION-type field on the source object
 * using the `relationCreationPayload` parameter.
 *
 * For MANY_TO_ONE: the field is created on the "many" side (fromObject),
 * and a reverse field is auto-created on the "one" side (toObject).
 */
export async function createRelation(
  relation: RelationDefinition,
  objectIdMap: Map<string, string>
): Promise<{ id: string; created: boolean }> {
  const fromId = objectIdMap.get(relation.fromObjectName);
  const toId = objectIdMap.get(relation.toObjectName);

  if (!fromId) {
    throw new Error(`Object ID not found for "${relation.fromObjectName}"`);
  }
  if (!toId) {
    throw new Error(`Object ID not found for "${relation.toObjectName}"`);
  }

  // Check if relation field already exists on the source object
  const fromObj = await getObjectById(fromId);
  if (fromObj) {
    const existingField = fromObj.fields.edges.find(
      (e) => e.node.name === relation.fromName
    );
    if (existingField) {
      console.log(
        `    [skip] Relation "${relation.fromObjectName}.${relation.fromName}" already exists`
      );
      return { id: existingField.node.id, created: false };
    }
  }

  const fromIcon = relation.fromIcon ?? "IconLink";
  const toIcon = relation.toIcon ?? "IconLink";

  const mutation = `mutation CreateRelationField($input: CreateOneFieldMetadataInput!) {
    createOneField(input: $input) {
      id name type
    }
  }`;

  const variables = {
    input: {
      field: {
        objectMetadataId: fromId,
        name: relation.fromName,
        label: relation.fromLabel,
        type: "RELATION",
        icon: fromIcon,
        isLabelSyncedWithName: false,
        relationCreationPayload: {
          type: relation.relationType,
          targetObjectMetadataId: toId,
          targetFieldLabel: relation.toLabel,
          targetFieldIcon: toIcon,
          targetFieldName: relation.toName,
        },
      },
    },
  };

  const data = await gqlRequest<{
    createOneField: { id: string; name: string; type: string };
  }>(mutation, variables, "CreateRelationField");

  console.log(
    `    [created] Relation ${relation.fromObjectName}.${relation.fromName} -> ${relation.toObjectName}.${relation.toName}`
  );
  return { id: data.createOneField.id, created: true };
}

// ---------- bulk operations ----------

export async function createFieldsForObject(
  objectId: string,
  objectName: string,
  fields: FieldDefinition[]
): Promise<{ created: number; skipped: number; errors: Array<{ field: string; message: string }> }> {
  let created = 0;
  let skipped = 0;
  const errors: Array<{ field: string; message: string }> = [];

  for (const field of fields) {
    try {
      const result = await createField(objectId, objectName, field);
      if (result.created) created++;
      else skipped++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    [error] Field "${field.name}" on "${objectName}": ${msg}`);
      errors.push({ field: field.name, message: msg });
    }
  }

  return { created, skipped, errors };
}
