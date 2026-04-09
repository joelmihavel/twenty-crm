/**
 * Validation tests for field definitions.
 * Ensures all SELECTs have options, no duplicate names, etc.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { tenantObject } from "../src/objects/tenant.js";
import { landlordObject } from "../src/objects/landlord.js";
import { propertyObject } from "../src/objects/property.js";
import { roomObject } from "../src/objects/room.js";
import { contractObject } from "../src/objects/contract.js";
import { ticketObject } from "../src/objects/ticket.js";
import { personExtension } from "../src/extensions/people.js";
import { opportunityExtension } from "../src/extensions/opportunity.js";
import { relations } from "../src/relations.js";

import type { FieldDefinition, ObjectDefinition } from "../src/types.js";

const allObjects: Array<{ name: string; fields: FieldDefinition[] }> = [
  { name: "tenant", fields: tenantObject.fields },
  { name: "landlord", fields: landlordObject.fields },
  { name: "property", fields: propertyObject.fields },
  { name: "room", fields: roomObject.fields },
  { name: "contract", fields: contractObject.fields },
  { name: "ticket", fields: ticketObject.fields },
  { name: "person (extension)", fields: personExtension.fields },
  { name: "opportunity (extension)", fields: opportunityExtension.fields },
];

const customObjects: ObjectDefinition[] = [
  tenantObject,
  landlordObject,
  propertyObject,
  roomObject,
  contractObject,
  ticketObject,
];

describe("Field definition validation", () => {
  for (const obj of allObjects) {
    describe(obj.name, () => {
      it("should have no duplicate field names", () => {
        const names = obj.fields.map((f) => f.name);
        const dupes = names.filter((n, i) => names.indexOf(n) !== i);
        assert.deepStrictEqual(dupes, [], `Duplicate field names: ${dupes.join(", ")}`);
      });

      it("should have options for all SELECT and MULTI_SELECT fields", () => {
        for (const field of obj.fields) {
          if (field.type === "SELECT" || field.type === "MULTI_SELECT") {
            assert.ok(
              field.options && field.options.length > 0,
              `Field "${field.name}" (${field.type}) must have options`
            );
          }
        }
      });

      it("should NOT have options for non-SELECT fields", () => {
        for (const field of obj.fields) {
          if (field.type !== "SELECT" && field.type !== "MULTI_SELECT") {
            assert.ok(
              !field.options || field.options.length === 0,
              `Field "${field.name}" (${field.type}) should not have options`
            );
          }
        }
      });

      it("should have non-empty labels for all fields", () => {
        for (const field of obj.fields) {
          assert.ok(field.label.length > 0, `Field "${field.name}" must have a label`);
        }
      });

      it("should have valid field names (camelCase, no spaces)", () => {
        for (const field of obj.fields) {
          assert.ok(
            /^[a-z][a-zA-Z0-9]*$/.test(field.name),
            `Field name "${field.name}" must be camelCase`
          );
        }
      });

      it("should have unique option values within each SELECT field", () => {
        for (const field of obj.fields) {
          if (field.options && field.options.length > 0) {
            const values = field.options.map((o) => o.value);
            const dupes = values.filter((v, i) => values.indexOf(v) !== i);
            assert.deepStrictEqual(
              dupes,
              [],
              `Field "${field.name}" has duplicate option values: ${dupes.join(", ")}`
            );
          }
        }
      });

      it("should have unique option IDs (UUIDs) within each SELECT field", () => {
        for (const field of obj.fields) {
          if (field.options && field.options.length > 0) {
            const ids = field.options.map((o) => o.id);
            const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
            assert.deepStrictEqual(
              dupes,
              [],
              `Field "${field.name}" has duplicate option IDs`
            );
          }
        }
      });
    });
  }
});

describe("Object definition validation", () => {
  it("should have 6 custom objects", () => {
    assert.strictEqual(customObjects.length, 6);
  });

  it("should have unique object names", () => {
    const names = customObjects.map((o) => o.nameSingular);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    assert.deepStrictEqual(dupes, [], `Duplicate object names: ${dupes.join(", ")}`);
  });

  for (const obj of customObjects) {
    it(`should have valid naming for "${obj.nameSingular}"`, () => {
      assert.ok(/^[a-z][a-zA-Z]*$/.test(obj.nameSingular), "nameSingular must be camelCase");
      assert.ok(/^[a-z][a-zA-Z]*$/.test(obj.namePlural), "namePlural must be camelCase");
      assert.ok(obj.labelSingular.length > 0, "labelSingular required");
      assert.ok(obj.labelPlural.length > 0, "labelPlural required");
      assert.ok(obj.icon.startsWith("Icon"), "icon must start with Icon");
    });
  }
});

describe("Relation validation", () => {
  it("should have 16 relations", () => {
    assert.strictEqual(relations.length, 16);
  });

  it("should all use MANY_TO_ONE", () => {
    for (const rel of relations) {
      assert.strictEqual(rel.relationType, "MANY_TO_ONE", `Relation ${rel.fromName} should be MANY_TO_ONE`);
    }
  });

  it("should have unique from-side field names per object", () => {
    // Group relations by fromObjectName
    const byObject = new Map<string, string[]>();
    for (const rel of relations) {
      const existing = byObject.get(rel.fromObjectName) ?? [];
      existing.push(rel.fromName);
      byObject.set(rel.fromObjectName, existing);
    }
    for (const [objName, names] of byObject) {
      const dupes = names.filter((n, i) => names.indexOf(n) !== i);
      assert.deepStrictEqual(
        dupes,
        [],
        `Object "${objName}" has duplicate relation fromName: ${dupes.join(", ")}`
      );
    }
  });

  it("should reference only known objects", () => {
    const knownObjects = new Set([
      "person",
      "opportunity",
      ...customObjects.map((o) => o.nameSingular),
    ]);
    for (const rel of relations) {
      assert.ok(
        knownObjects.has(rel.fromObjectName),
        `Unknown fromObject: ${rel.fromObjectName}`
      );
      assert.ok(
        knownObjects.has(rel.toObjectName),
        `Unknown toObject: ${rel.toObjectName}`
      );
    }
  });
});

describe("Total field count", () => {
  it("should have approximately 150 fields across all objects and extensions", () => {
    let total = 0;
    for (const obj of allObjects) {
      total += obj.fields.length;
    }
    console.log(`  Total fields defined: ${total}`);
    // Should be roughly 150 (the spec says ~150)
    assert.ok(total >= 130, `Expected at least 130 fields, got ${total}`);
    assert.ok(total <= 180, `Expected at most 180 fields, got ${total}`);
  });
});
