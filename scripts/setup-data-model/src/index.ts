/**
 * Flent Twenty CRM Data Model Setup
 *
 * Orchestrates creation of:
 *  - 7 custom fields on Person (standard object)
 *  - 9 custom fields on Opportunity (standard object)
 *  - 6 custom objects with ~130+ fields
 *  - 16 relations between objects
 *
 * Idempotent: safe to re-run — skips existing objects/fields.
 */

import {
  createObject,
  createFieldsForObject,
  createRelation,
  listObjects,
} from "./metadata-client.js";

// Extensions
import { personExtension, PERSON_OBJECT_ID } from "./extensions/people.js";
import { opportunityExtension, OPPORTUNITY_OBJECT_ID } from "./extensions/opportunity.js";

// Custom objects
import { tenantObject } from "./objects/tenant.js";
import { landlordObject } from "./objects/landlord.js";
import { propertyObject } from "./objects/property.js";
import { roomObject } from "./objects/room.js";
import { contractObject } from "./objects/contract.js";
import { ticketObject } from "./objects/ticket.js";

// Relations
import { relations } from "./relations.js";

import type { SetupResult } from "./types.js";

// ---- helpers ----

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function banner(msg: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}`);
}

// ---- main ----

async function main(): Promise<SetupResult> {
  const result: SetupResult = {
    objectsCreated: [],
    fieldsCreated: 0,
    relationsCreated: 0,
    errors: [],
  };

  const API_KEY = process.env.TWENTY_API_KEY;
  if (!API_KEY) {
    console.error("ERROR: TWENTY_API_KEY environment variable is required.");
    process.exit(1);
  }

  console.log("Flent Twenty CRM Data Model Setup");
  console.log(`Metadata API: ${process.env.TWENTY_METADATA_URL ?? "http://localhost:3000/metadata"}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Verify connectivity
  try {
    const objects = await listObjects();
    console.log(`Connected. Found ${objects.length} existing objects.`);
  } catch (err) {
    console.error("Failed to connect to Twenty metadata API:", err);
    process.exit(1);
  }

  // ── Phase 1: Extend standard objects ──────────────────────────────

  banner("Phase 1: Extend Person (standard object)");
  {
    const res = await createFieldsForObject(
      personExtension.objectId,
      personExtension.objectName,
      personExtension.fields
    );
    result.fieldsCreated += res.created;
    for (const e of res.errors) {
      result.errors.push({ context: `person.${e.field}`, message: e.message });
    }
    console.log(`  Person fields: ${res.created} created, ${res.skipped} skipped, ${res.errors.length} errors`);
  }

  banner("Phase 1: Extend Opportunity (standard object)");
  {
    const res = await createFieldsForObject(
      opportunityExtension.objectId,
      opportunityExtension.objectName,
      opportunityExtension.fields
    );
    result.fieldsCreated += res.created;
    for (const e of res.errors) {
      result.errors.push({ context: `opportunity.${e.field}`, message: e.message });
    }
    console.log(`  Opportunity fields: ${res.created} created, ${res.skipped} skipped, ${res.errors.length} errors`);
  }

  // ── Phase 2: Create custom objects and their fields ───────────────

  const customObjects = [
    tenantObject,
    landlordObject,
    propertyObject,
    roomObject,
    contractObject,
    ticketObject,
  ];

  // Map of objectName -> objectId (include standard objects)
  const objectIdMap = new Map<string, string>();
  objectIdMap.set("person", PERSON_OBJECT_ID);
  objectIdMap.set("opportunity", OPPORTUNITY_OBJECT_ID);

  for (const obj of customObjects) {
    banner(`Phase 2: Create object "${obj.nameSingular}" (${obj.fields.length} fields)`);

    try {
      const { id } = await createObject({
        nameSingular: obj.nameSingular,
        namePlural: obj.namePlural,
        labelSingular: obj.labelSingular,
        labelPlural: obj.labelPlural,
        icon: obj.icon,
        description: obj.description,
      });
      objectIdMap.set(obj.nameSingular, id);
      result.objectsCreated.push(obj.nameSingular);

      // Brief pause for schema sync after object creation
      await sleep(1000);

      // Create fields
      const res = await createFieldsForObject(id, obj.nameSingular, obj.fields);
      result.fieldsCreated += res.created;
      for (const e of res.errors) {
        result.errors.push({ context: `${obj.nameSingular}.${e.field}`, message: e.message });
      }
      console.log(
        `  ${obj.nameSingular} fields: ${res.created} created, ${res.skipped} skipped, ${res.errors.length} errors`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [FATAL] Failed to create object "${obj.nameSingular}": ${msg}`);
      result.errors.push({ context: obj.nameSingular, message: msg });
    }
  }

  // ── Phase 3: Create relations ─────────────────────────────────────

  banner("Phase 3: Create 16 relations");
  console.log("Waiting 3s for schema sync...\n");
  await sleep(3000);

  for (const rel of relations) {
    try {
      const res = await createRelation(rel, objectIdMap);
      if (res.created) result.relationsCreated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `    [error] Relation ${rel.fromObjectName}.${rel.fromName} -> ${rel.toObjectName}.${rel.toName}: ${msg}`
      );
      result.errors.push({
        context: `relation:${rel.fromObjectName}.${rel.fromName}->${rel.toObjectName}.${rel.toName}`,
        message: msg,
      });
    }
  }

  // ── Summary ───────────────────────────────────────────────────────

  banner("Setup Complete");
  console.log(`  Objects created/verified: ${result.objectsCreated.length}`);
  console.log(`  Fields created: ${result.fieldsCreated}`);
  console.log(`  Relations created: ${result.relationsCreated}`);
  console.log(`  Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("\n  Error details:");
    for (const e of result.errors) {
      console.log(`    - [${e.context}] ${e.message}`);
    }
  }

  return result;
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
