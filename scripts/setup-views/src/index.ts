/**
 * Flent Twenty CRM -- View Setup Script
 *
 * Creates 17 views on the metadata API with filters.
 * Idempotent: checks for existing views by name + objectMetadataId before creating.
 *
 * Usage:
 *   TWENTY_API_KEY=<key> npm run setup
 */

import { VIEW_DEFINITIONS, OBJECT_IDS, type ViewDefinition } from "./view-definitions.js";

// ── Config ──────────────────────────────────────────────────────────────

const METADATA_URL =
  process.env.TWENTY_METADATA_URL ?? "http://localhost:3000/metadata";
const API_KEY = process.env.TWENTY_API_KEY ?? "";

// ── GraphQL client ──────────────────────────────────────────────────────

async function gql<T>(query: string): Promise<T> {
  const res = await fetch(METADATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  if (!json.data) {
    throw new Error("No data in response");
  }

  return json.data;
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

// ── Queries ─────────────────────────────────────────────────────────────

interface ExistingView {
  id: string;
  name: string;
  objectMetadataId: string;
  type: string;
}

async function getExistingViews(): Promise<ExistingView[]> {
  const data = await gql<{ getViews: ExistingView[] }>(
    `{ getViews { id name objectMetadataId type } }`
  );
  return data.getViews;
}

interface FieldMeta {
  id: string;
  name: string;
  type: string;
}

/**
 * Build a lookup: objectId -> { fieldName -> fieldMetadataId }
 * Only fetches objects we actually need.
 */
async function buildFieldIndex(): Promise<
  Map<string, Map<string, string>>
> {
  const objectIds = new Set(
    VIEW_DEFINITIONS.map((v) => OBJECT_IDS[v.objectKey])
  );
  const index = new Map<string, Map<string, string>>();

  for (const oid of objectIds) {
    const data = await gql<{
      object: {
        id: string;
        fields: { edges: Array<{ node: FieldMeta }> };
      };
    }>(
      `{ object(id: "${oid}") { id fields(paging: { first: 500 }) { edges { node { id name type } } } } }`
    );

    const fieldMap = new Map<string, string>();
    for (const edge of data.object.fields.edges) {
      fieldMap.set(edge.node.name, edge.node.id);
    }
    index.set(oid, fieldMap);
  }

  return index;
}

// ── Mutations ───────────────────────────────────────────────────────────

interface CreateViewResult {
  id: string;
}

async function createView(
  def: ViewDefinition,
  objectMetadataId: string,
  fieldIndex: Map<string, Map<string, string>>
): Promise<CreateViewResult> {
  // Resolve kanban group-by field if needed
  let kanbanPart = "";
  if (def.type === "KANBAN" && def.kanbanGroupByFieldName) {
    const fields = fieldIndex.get(objectMetadataId);
    const groupByFieldId = fields?.get(def.kanbanGroupByFieldName);
    if (!groupByFieldId) {
      throw new Error(
        `Kanban group-by field "${def.kanbanGroupByFieldName}" not found on ${def.objectKey}`
      );
    }
    kanbanPart = `mainGroupByFieldMetadataId: "${groupByFieldId}"`;
  }

  const mutation = `mutation {
    createView(input: {
      name: "${esc(def.name)}"
      objectMetadataId: "${objectMetadataId}"
      type: ${def.type}
      icon: "${esc(def.icon)}"
      position: ${def.position}
      visibility: WORKSPACE
      ${kanbanPart}
    }) { id }
  }`;

  const data = await gql<{ createView: { id: string } }>(mutation);
  return { id: data.createView.id };
}

async function createViewFilterGroup(
  viewId: string
): Promise<string> {
  const mutation = `mutation {
    createViewFilterGroup(input: {
      viewId: "${viewId}"
      logicalOperator: AND
      positionInViewFilterGroup: 0
    }) { id }
  }`;

  const data = await gql<{ createViewFilterGroup: { id: string } }>(mutation);
  return data.createViewFilterGroup.id;
}

async function createViewFilter(
  viewId: string,
  viewFilterGroupId: string,
  fieldMetadataId: string,
  operand: string,
  value: string,
  position: number
): Promise<string> {
  // The value needs to be valid JSON passed as a JSON scalar
  const escapedValue = esc(value);
  const mutation = `mutation {
    createViewFilter(input: {
      viewId: "${viewId}"
      viewFilterGroupId: "${viewFilterGroupId}"
      fieldMetadataId: "${fieldMetadataId}"
      operand: ${operand}
      value: "${escapedValue}"
      positionInViewFilterGroup: ${position}
    }) { id }
  }`;

  const data = await gql<{ createViewFilter: { id: string } }>(mutation);
  return data.createViewFilter.id;
}

// ── Main ────────────────────────────────────────────────────────────────

interface SetupResult {
  viewsCreated: string[];
  viewsSkipped: string[];
  filtersCreated: number;
  errors: Array<{ context: string; message: string }>;
}

function banner(msg: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}`);
}

async function main(): Promise<SetupResult> {
  const result: SetupResult = {
    viewsCreated: [],
    viewsSkipped: [],
    filtersCreated: 0,
    errors: [],
  };

  if (!API_KEY) {
    console.error("ERROR: TWENTY_API_KEY environment variable is required.");
    process.exit(1);
  }

  console.log("Flent Twenty CRM -- View Setup");
  console.log(`Metadata API: ${METADATA_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // ── Step 1: Fetch existing views for idempotency ────────────────────
  banner("Step 1: Fetching existing views");

  let existingViews: ExistingView[];
  try {
    existingViews = await getExistingViews();
    console.log(`  Found ${existingViews.length} existing views.`);
  } catch (err) {
    console.error("Failed to fetch views:", err);
    process.exit(1);
  }

  // Build a lookup key: "name|objectMetadataId" -> view
  const existingLookup = new Map<string, ExistingView>();
  for (const v of existingViews) {
    existingLookup.set(`${v.name}|${v.objectMetadataId}`, v);
  }

  // ── Step 2: Build field index for filters ───────────────────────────
  banner("Step 2: Building field index");

  let fieldIndex: Map<string, Map<string, string>>;
  try {
    fieldIndex = await buildFieldIndex();
    console.log(
      `  Indexed fields for ${fieldIndex.size} objects.`
    );
  } catch (err) {
    console.error("Failed to build field index:", err);
    process.exit(1);
  }

  // ── Step 3: Create views + filters ──────────────────────────────────
  banner("Step 3: Creating 17 views");

  for (const def of VIEW_DEFINITIONS) {
    const objectMetadataId = OBJECT_IDS[def.objectKey];
    const lookupKey = `${def.name}|${objectMetadataId}`;

    // Idempotency check
    if (existingLookup.has(lookupKey)) {
      const existing = existingLookup.get(lookupKey)!;
      console.log(
        `  [skip] "${def.name}" already exists (${existing.id})`
      );
      result.viewsSkipped.push(def.name);
      continue;
    }

    try {
      // Create the view
      const view = await createView(def, objectMetadataId, fieldIndex);
      console.log(
        `  [created] "${def.name}" (${def.type}) -> ${view.id}`
      );
      result.viewsCreated.push(def.name);

      // Create filters if any
      if (def.filters.length > 0) {
        const fields = fieldIndex.get(objectMetadataId);
        if (!fields) {
          throw new Error(
            `No field index for object ${def.objectKey} (${objectMetadataId})`
          );
        }

        // Create a filter group first
        const filterGroupId = await createViewFilterGroup(view.id);

        for (let i = 0; i < def.filters.length; i++) {
          const filter = def.filters[i];
          const fieldMetadataId = fields.get(filter.fieldName);

          if (!fieldMetadataId) {
            const msg = `Field "${filter.fieldName}" not found on ${def.objectKey}`;
            console.error(`    [error] ${msg}`);
            result.errors.push({ context: def.name, message: msg });
            continue;
          }

          const filterId = await createViewFilter(
            view.id,
            filterGroupId,
            fieldMetadataId,
            filter.operand,
            filter.value,
            i
          );
          console.log(
            `    [filter] ${filter.fieldName} ${filter.operand} ${filter.value} -> ${filterId}`
          );
          result.filtersCreated++;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [error] "${def.name}": ${msg}`);
      result.errors.push({ context: def.name, message: msg });
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
  banner("View Setup Complete");
  console.log(`  Views created:  ${result.viewsCreated.length}`);
  console.log(`  Views skipped:  ${result.viewsSkipped.length}`);
  console.log(`  Filters created: ${result.filtersCreated}`);
  console.log(`  Errors:         ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("\n  Error details:");
    for (const e of result.errors) {
      console.log(`    - [${e.context}] ${e.message}`);
    }
  }

  if (result.viewsCreated.length > 0) {
    console.log("\n  Views created:");
    for (const name of result.viewsCreated) {
      console.log(`    + ${name}`);
    }
  }

  return result;
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
