# Phase 2: Custom Data Model + Views — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 5 custom objects (Tenant, Landlord, Property, Room, Contract, Ticket) with ~150 fields, relations, SELECT options, views, and RBAC roles in Twenty CRM via the metadata API — then update the HubSpot mirror to populate data into the new structure.

**Architecture:** TypeScript setup scripts call Twenty's metadata GraphQL API (`/metadata`) to create objects, fields, and relations programmatically. A separate script configures views. The mirror function is updated to map HubSpot data into the new custom objects. Everything is idempotent — safe to re-run.

**Tech Stack:** TypeScript, Twenty Metadata GraphQL API, vitest for testing

**Spec:** `docs/specs/2026-04-09-flent-twenty-migration-design.md` (Sections 3.1-3.8, 6, 7)

**Prerequisites:** Twenty running at `localhost:3000` (port-forwarded), API key in Secret Manager

---

## File Structure

```
flent-infra/
├── scripts/
│   ├── setup-data-model/
│   │   ├── src/
│   │   │   ├── index.ts              # Main orchestrator — creates all objects, fields, relations
│   │   │   ├── metadata-client.ts    # Twenty metadata API client (createObject, createField, createRelation)
│   │   │   ├── objects/
│   │   │   │   ├── tenant.ts         # Tenant object definition (fields, selects, relations)
│   │   │   │   ├── landlord.ts       # Landlord object definition
│   │   │   │   ├── property.ts       # Property object definition
│   │   │   │   ├── room.ts           # Room object definition
│   │   │   │   ├── contract.ts       # Contract object definition
│   │   │   │   └── ticket.ts         # Ticket object definition
│   │   │   ├── extensions/
│   │   │   │   ├── people.ts         # Additional fields for People (standard object)
│   │   │   │   └── opportunity.ts    # Additional fields for Opportunity (standard object)
│   │   │   ├── relations.ts          # All cross-object relations
│   │   │   └── types.ts              # Shared types (FieldDefinition, ObjectDefinition, etc.)
│   │   ├── test/
│   │   │   ├── metadata-client.test.ts
│   │   │   └── objects.test.ts       # Validate all object definitions have required fields
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── setup-views/
│       ├── src/
│       │   ├── index.ts              # Creates all 17 views via Twenty API
│       │   └── view-definitions.ts   # View name, object, filters, columns
│       ├── package.json
│       └── tsconfig.json
├── functions/
│   └── hubspot-mirror/
│       └── src/
│           ├── twenty-client.ts      # UPDATED: real upsert mutations for custom objects
│           └── field-mapping.ts      # UPDATED: map to custom object field names
```

---

## Task 1: Metadata API Client

**Files:**
- Create: `scripts/setup-data-model/src/metadata-client.ts`
- Create: `scripts/setup-data-model/src/types.ts`
- Create: `scripts/setup-data-model/test/metadata-client.test.ts`
- Create: `scripts/setup-data-model/package.json`
- Create: `scripts/setup-data-model/tsconfig.json`

- [ ] **Step 1: Initialize the project**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra
mkdir -p scripts/setup-data-model/{src/objects,src/extensions,test}
```

```json
// scripts/setup-data-model/package.json
{
  "name": "setup-data-model",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx src/index.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "tsx": "^4.19.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@types/node": "^22.0.0"
  }
}
```

```json
// scripts/setup-data-model/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 2: Define types**

```typescript
// scripts/setup-data-model/src/types.ts

export interface SelectOption {
  label: string;
  value: string;
  color: string;
  position: number;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: "TEXT" | "NUMBER" | "BOOLEAN" | "DATE" | "DATE_TIME" | "SELECT" | "MULTI_SELECT" | "CURRENCY" | "LINKS" | "RICH_TEXT" | "RATING" | "ADDRESS" | "PHONES" | "EMAILS";
  icon: string;
  description?: string;
  options?: SelectOption[];
  defaultValue?: unknown;
  isRequired?: boolean;
}

export interface RelationDefinition {
  fromObjectName: string;
  toObjectName: string;
  fromFieldName: string;
  toFieldName: string;
  fromLabel: string;
  toLabel: string;
  type: "ONE_TO_MANY" | "MANY_TO_ONE";
}

export interface ObjectDefinition {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  description: string;
  fields: FieldDefinition[];
}

export interface CreatedObject {
  id: string;
  nameSingular: string;
}

export interface CreatedField {
  id: string;
  name: string;
  type: string;
}

// Color palette for SELECT options
export const COLORS = {
  green: "green",
  red: "red",
  blue: "blue",
  yellow: "yellow",
  orange: "orange",
  purple: "purple",
  pink: "pink",
  gray: "gray",
  turquoise: "turquoise",
  sky: "sky",
} as const;
```

- [ ] **Step 3: Write metadata client tests**

```typescript
// scripts/setup-data-model/test/metadata-client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MetadataClient } from "../src/metadata-client.js";

describe("MetadataClient", () => {
  let client: MetadataClient;

  beforeEach(() => {
    client = new MetadataClient("http://localhost:3000", "test-api-key");
  });

  it("should construct with base URL and API key", () => {
    expect(client).toBeDefined();
  });

  it("should build correct createObject mutation", () => {
    // Test that the mutation string is well-formed
    const mutation = (client as any).buildCreateObjectMutation({
      nameSingular: "tenant",
      namePlural: "tenants",
      labelSingular: "Tenant",
      labelPlural: "Tenants",
      icon: "IconUser",
      description: "Tenant profile",
    });
    expect(mutation).toContain("createOneObject");
    expect(mutation).toContain("tenant");
  });

  it("should build correct createField mutation", () => {
    const mutation = (client as any).buildCreateFieldMutation(
      "obj-id-123",
      {
        name: "monthlyRent",
        label: "Monthly Rent",
        type: "CURRENCY",
        icon: "IconCurrency",
      }
    );
    expect(mutation).toContain("createOneField");
    expect(mutation).toContain("monthlyRent");
    expect(mutation).toContain("CURRENCY");
  });

  it("should build SELECT field with options", () => {
    const mutation = (client as any).buildCreateFieldMutation(
      "obj-id-123",
      {
        name: "status",
        label: "Status",
        type: "SELECT",
        icon: "IconCircle",
        options: [
          { label: "Active", value: "ACTIVE", color: "green", position: 0 },
          { label: "Churned", value: "CHURNED", color: "red", position: 1 },
        ],
      }
    );
    expect(mutation).toContain("options");
    expect(mutation).toContain("ACTIVE");
    expect(mutation).toContain("green");
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra/scripts/setup-data-model
npm install
npx vitest run
```

Expected: FAIL — MetadataClient not defined.

- [ ] **Step 5: Implement metadata client**

```typescript
// scripts/setup-data-model/src/metadata-client.ts
import type { FieldDefinition, ObjectDefinition, CreatedObject, CreatedField, SelectOption } from "./types.js";

export class MetadataClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async graphql(query: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/metadata`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Metadata API error ${response.status}: ${text}`);
    }

    const data = await response.json();
    if (data.errors?.length) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }
    return data.data;
  }

  async findObjectByName(nameSingular: string): Promise<CreatedObject | null> {
    const query = `{
      objects(paging: { first: 100 }) {
        edges {
          node { id nameSingular }
        }
      }
    }`;
    const data = await this.graphql(query);
    const match = data.objects.edges.find(
      (e: any) => e.node.nameSingular === nameSingular
    );
    return match ? match.node : null;
  }

  async createObject(def: Omit<ObjectDefinition, "fields">): Promise<CreatedObject> {
    // Idempotent: check if exists first
    const existing = await this.findObjectByName(def.nameSingular);
    if (existing) {
      console.log(`  Object "${def.nameSingular}" already exists (${existing.id})`);
      return existing;
    }

    const query = this.buildCreateObjectMutation(def);
    const data = await this.graphql(query);
    const created = data.createOneObject;
    console.log(`  Created object "${def.nameSingular}" (${created.id})`);
    return created;
  }

  private buildCreateObjectMutation(def: Omit<ObjectDefinition, "fields">): string {
    return `mutation {
      createOneObject(input: {
        object: {
          nameSingular: "${def.nameSingular}"
          namePlural: "${def.namePlural}"
          labelSingular: "${def.labelSingular}"
          labelPlural: "${def.labelPlural}"
          icon: "${def.icon}"
          description: "${def.description || ""}"
          isLabelSyncedWithName: false
        }
      }) {
        id nameSingular isCustom
      }
    }`;
  }

  async findFieldByName(objectId: string, fieldName: string): Promise<CreatedField | null> {
    const query = `{
      objects(paging: { first: 100 }) {
        edges {
          node {
            id nameSingular
            fields(paging: { first: 200 }) {
              edges { node { id name type } }
            }
          }
        }
      }
    }`;
    const data = await this.graphql(query);
    for (const edge of data.objects.edges) {
      if (edge.node.id === objectId) {
        const match = edge.node.fields.edges.find(
          (f: any) => f.node.name === fieldName
        );
        return match ? match.node : null;
      }
    }
    return null;
  }

  async createField(objectId: string, def: FieldDefinition): Promise<CreatedField> {
    // Idempotent
    const existing = await this.findFieldByName(objectId, def.name);
    if (existing) {
      console.log(`    Field "${def.name}" already exists`);
      return existing;
    }

    const query = this.buildCreateFieldMutation(objectId, def);
    const data = await this.graphql(query);
    const created = data.createOneField;
    console.log(`    Created field "${def.name}" (${created.type})`);
    return created;
  }

  private buildCreateFieldMutation(objectId: string, def: FieldDefinition): string {
    const optionsStr = def.options
      ? `, options: ${JSON.stringify(def.options).replace(/"([^"]+)":/g, "$1:")}`
      : "";

    const defaultStr = def.defaultValue !== undefined
      ? `, defaultValue: ${JSON.stringify(def.defaultValue)}`
      : "";

    return `mutation {
      createOneField(input: {
        field: {
          objectMetadataId: "${objectId}"
          name: "${def.name}"
          label: "${def.label}"
          type: ${def.type}
          icon: "${def.icon}"
          description: "${def.description || ""}"
          isLabelSyncedWithName: false
          ${optionsStr}
          ${defaultStr}
        }
      }) {
        id name type
      }
    }`;
  }

  async createRelation(
    fromObjectId: string,
    toObjectId: string,
    fromFieldName: string,
    toFieldName: string,
    fromLabel: string,
    toLabel: string,
    relationType: "ONE_TO_MANY" | "MANY_TO_ONE" = "MANY_TO_ONE"
  ): Promise<void> {
    // Check if relation field already exists
    const existing = await this.findFieldByName(fromObjectId, fromFieldName);
    if (existing) {
      console.log(`    Relation "${fromFieldName}" already exists`);
      return;
    }

    const query = `mutation {
      createOneRelation(input: {
        relation: {
          fromObjectMetadataId: "${fromObjectId}"
          toObjectMetadataId: "${toObjectId}"
          fromName: "${fromFieldName}"
          toName: "${toFieldName}"
          fromLabel: "${fromLabel}"
          toLabel: "${toLabel}"
          relationType: ${relationType}
          fromIcon: "IconLink"
          toIcon: "IconLink"
        }
      }) {
        id
      }
    }`;

    await this.graphql(query);
    console.log(`    Created relation: ${fromFieldName} -> ${toFieldName}`);
  }
}
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npx vitest run
```

Expected: All PASS.

- [ ] **Step 7: Commit**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra
git add scripts/setup-data-model/
git commit -m "feat: metadata API client for creating custom objects, fields, and relations"
```

---

## Task 2: Object Definitions (Tenant, Landlord, Property, Room, Contract, Ticket)

**Files:**
- Create: `scripts/setup-data-model/src/objects/tenant.ts`
- Create: `scripts/setup-data-model/src/objects/landlord.ts`
- Create: `scripts/setup-data-model/src/objects/property.ts`
- Create: `scripts/setup-data-model/src/objects/room.ts`
- Create: `scripts/setup-data-model/src/objects/contract.ts`
- Create: `scripts/setup-data-model/src/objects/ticket.ts`
- Create: `scripts/setup-data-model/src/extensions/people.ts`
- Create: `scripts/setup-data-model/src/extensions/opportunity.ts`
- Create: `scripts/setup-data-model/test/objects.test.ts`

This is a large task with many fields. I'll provide the complete code for each object. Each file exports an `ObjectDefinition` with all fields from the spec.

- [ ] **Step 1: Write validation test**

```typescript
// scripts/setup-data-model/test/objects.test.ts
import { describe, it, expect } from "vitest";
import { TENANT_OBJECT } from "../src/objects/tenant.js";
import { LANDLORD_OBJECT } from "../src/objects/landlord.js";
import { PROPERTY_OBJECT } from "../src/objects/property.js";
import { ROOM_OBJECT } from "../src/objects/room.js";
import { CONTRACT_OBJECT } from "../src/objects/contract.js";
import { TICKET_OBJECT } from "../src/objects/ticket.js";
import { PEOPLE_EXTENSIONS } from "../src/extensions/people.js";
import { OPPORTUNITY_EXTENSIONS } from "../src/extensions/opportunity.js";

describe("Object definitions", () => {
  it("Tenant has required fields", () => {
    const names = TENANT_OBJECT.fields.map(f => f.name);
    expect(names).toContain("customerStatus");
    expect(names).toContain("tenantLifecycle");
    expect(names).toContain("monthlyRent");
    expect(names).toContain("moveInDate");
    expect(names).toContain("hubspotRecordId");
    expect(TENANT_OBJECT.fields.length).toBeGreaterThanOrEqual(20);
  });

  it("Landlord has required fields", () => {
    const names = LANDLORD_OBJECT.fields.map(f => f.name);
    expect(names).toContain("landlordStatus");
    expect(names).toContain("cashfreeVendorId");
    expect(names).toContain("bankAccountNumber");
    expect(names).toContain("ifscCode");
    expect(LANDLORD_OBJECT.fields.length).toBeGreaterThanOrEqual(10);
  });

  it("Property has required fields including utilities", () => {
    const names = PROPERTY_OBJECT.fields.map(f => f.name);
    expect(names).toContain("pid");
    expect(names).toContain("area");
    expect(names).toContain("grade");
    expect(names).toContain("electricityProvider");
    expect(names).toContain("wifiSsid");
    expect(PROPERTY_OBJECT.fields.length).toBeGreaterThanOrEqual(25);
  });

  it("Room has rent tier fields", () => {
    const names = ROOM_OBJECT.fields.map(f => f.name);
    expect(names).toContain("roomId");
    expect(names).toContain("threeMonthLockInRent");
    expect(names).toContain("status");
    expect(ROOM_OBJECT.fields.length).toBeGreaterThanOrEqual(5);
  });

  it("Contract has financial + agreement fields", () => {
    const names = CONTRACT_OBJECT.fields.map(f => f.name);
    expect(names).toContain("contractId");
    expect(names).toContain("contractType");
    expect(names).toContain("monthlyLicenseFee");
    expect(names).toContain("agreementStatus");
    expect(names).toContain("lfSettlementDay");
    expect(CONTRACT_OBJECT.fields.length).toBeGreaterThanOrEqual(30);
  });

  it("Ticket has pipeline and category fields", () => {
    const names = TICKET_OBJECT.fields.map(f => f.name);
    expect(names).toContain("pipeline");
    expect(names).toContain("ticketStatus");
    expect(names).toContain("category");
    expect(names).toContain("priority");
    expect(TICKET_OBJECT.fields.length).toBeGreaterThanOrEqual(10);
  });

  it("People extensions include role and lead source", () => {
    const names = PEOPLE_EXTENSIONS.map(f => f.name);
    expect(names).toContain("role");
    expect(names).toContain("leadSource");
    expect(names).toContain("aadharNumber");
    expect(names).toContain("hubspotRecordId");
  });

  it("Opportunity extensions include pipelineType", () => {
    const names = OPPORTUNITY_EXTENSIONS.map(f => f.name);
    expect(names).toContain("pipelineType");
    expect(names).toContain("hubspotRecordId");
  });

  it("All SELECT fields have options defined", () => {
    const allFields = [
      ...TENANT_OBJECT.fields,
      ...LANDLORD_OBJECT.fields,
      ...PROPERTY_OBJECT.fields,
      ...ROOM_OBJECT.fields,
      ...CONTRACT_OBJECT.fields,
      ...TICKET_OBJECT.fields,
      ...PEOPLE_EXTENSIONS,
      ...OPPORTUNITY_EXTENSIONS,
    ];
    const selectFields = allFields.filter(f => f.type === "SELECT" || f.type === "MULTI_SELECT");
    for (const f of selectFields) {
      expect(f.options, `${f.name} missing options`).toBeDefined();
      expect(f.options!.length, `${f.name} has 0 options`).toBeGreaterThan(0);
    }
  });

  it("All fields have unique names within their object", () => {
    const objects = [TENANT_OBJECT, LANDLORD_OBJECT, PROPERTY_OBJECT, ROOM_OBJECT, CONTRACT_OBJECT, TICKET_OBJECT];
    for (const obj of objects) {
      const names = obj.fields.map(f => f.name);
      const unique = new Set(names);
      expect(unique.size, `${obj.nameSingular} has duplicate field names`).toBe(names.length);
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run
```

Expected: FAIL — object modules not yet defined.

- [ ] **Step 3: Implement all object definitions**

Due to the size (~150 fields across 8 files), I'll provide the implementation as a single subagent task. The subagent must create all files with complete field definitions matching the spec exactly.

Each object file follows this pattern:

```typescript
// scripts/setup-data-model/src/objects/tenant.ts
import type { ObjectDefinition } from "../types.js";
import { COLORS } from "../types.js";

export const TENANT_OBJECT: ObjectDefinition = {
  nameSingular: "tenant",
  namePlural: "tenants",
  labelSingular: "Tenant",
  labelPlural: "Tenants",
  icon: "IconUser",
  description: "Tenant profile linked to a person",
  fields: [
    { name: "hubspotRecordId", label: "HubSpot Record ID", type: "TEXT", icon: "IconId" },
    {
      name: "customerStatus",
      label: "Customer Status",
      type: "SELECT",
      icon: "IconCircle",
      options: [
        { label: "Active", value: "ACTIVE", color: COLORS.green, position: 0 },
        { label: "Churned", value: "CHURNED", color: COLORS.red, position: 1 },
        { label: "Lead", value: "LEAD", color: COLORS.blue, position: 2 },
        { label: "Gestation", value: "GESTATION", color: COLORS.yellow, position: 3 },
        { label: "Move-out Initiated", value: "MOVE_OUT_INITIATED", color: COLORS.orange, position: 4 },
      ],
    },
    // ... ALL remaining fields from spec Section 3.2
    // The subagent must include EVERY field listed in the spec
  ],
};
```

The subagent implementing this task MUST create ALL fields listed in spec Sections 3.1-3.8, using the correct Twenty field types (TEXT, CURRENCY, SELECT, DATE, etc.) and SELECT options with the exact values from the spec.

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run
```

Expected: All PASS — all objects have required fields, all SELECTs have options, no duplicates.

- [ ] **Step 5: Commit**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra
git add scripts/setup-data-model/src/objects/ scripts/setup-data-model/src/extensions/ scripts/setup-data-model/test/
git commit -m "feat: all 6 custom object definitions + People/Opportunity extensions (~150 fields)"
```

---

## Task 3: Relations Definition

**Files:**
- Create: `scripts/setup-data-model/src/relations.ts`

- [ ] **Step 1: Define all cross-object relations**

```typescript
// scripts/setup-data-model/src/relations.ts
// All relations from the spec's Object Relationship Map

export interface RelationConfig {
  fromObject: string;  // nameSingular of source object
  toObject: string;    // nameSingular of target object
  fromField: string;   // field name on source
  toField: string;     // field name on target
  fromLabel: string;   // label shown on source
  toLabel: string;     // label shown on target
}

export const RELATIONS: RelationConfig[] = [
  // Tenant -> People (1:1)
  { fromObject: "tenant", toObject: "person", fromField: "person", toField: "tenant", fromLabel: "Person", toLabel: "Tenant" },
  // Tenant -> Property (current)
  { fromObject: "tenant", toObject: "property", fromField: "property", toField: "tenants", fromLabel: "Property", toLabel: "Tenants" },
  // Tenant -> Room (current)
  { fromObject: "tenant", toObject: "room", fromField: "room", toField: "currentTenants", fromLabel: "Room", toLabel: "Current Tenants" },
  // Tenant -> Contract (active)
  { fromObject: "tenant", toObject: "contract", fromField: "activeContract", toField: "tenantRef", fromLabel: "Active Contract", toLabel: "Tenant Ref" },

  // Landlord -> People (1:1)
  { fromObject: "landlord", toObject: "person", fromField: "person", toField: "landlord", fromLabel: "Person", toLabel: "Landlord" },

  // Property -> Room (1:many)
  { fromObject: "room", toObject: "property", fromField: "property", toField: "rooms", fromLabel: "Property", toLabel: "Rooms" },

  // Contract -> Tenant
  { fromObject: "contract", toObject: "tenant", fromField: "tenant", toField: "contracts", fromLabel: "Tenant", toLabel: "Contracts" },
  // Contract -> Landlord
  { fromObject: "contract", toObject: "landlord", fromField: "landlord", toField: "contracts", fromLabel: "Landlord", toLabel: "Contracts" },
  // Contract -> Property
  { fromObject: "contract", toObject: "property", fromField: "property", toField: "contracts", fromLabel: "Property", toLabel: "Contracts" },
  // Contract -> Room
  { fromObject: "contract", toObject: "room", fromField: "room", toField: "contracts", fromLabel: "Room", toLabel: "Contracts" },
  // Contract -> People (party)
  { fromObject: "contract", toObject: "person", fromField: "person", toField: "contractsAsParty", fromLabel: "Person", toLabel: "Contracts (Party)" },

  // Ticket -> Property
  { fromObject: "ticket", toObject: "property", fromField: "property", toField: "tickets", fromLabel: "Property", toLabel: "Tickets" },
  // Ticket -> Tenant
  { fromObject: "ticket", toObject: "tenant", fromField: "tenant", toField: "tickets", fromLabel: "Tenant", toLabel: "Tickets" },
  // Ticket -> Landlord
  { fromObject: "ticket", toObject: "landlord", fromField: "landlord", toField: "tickets", fromLabel: "Landlord", toLabel: "Tickets" },

  // Opportunity -> Property
  { fromObject: "opportunity", toObject: "property", fromField: "property", toField: "opportunities", fromLabel: "Property", toLabel: "Opportunities" },
  // Opportunity -> Room
  { fromObject: "opportunity", toObject: "room", fromField: "room", toField: "opportunities", fromLabel: "Room", toLabel: "Opportunities" },
];
```

- [ ] **Step 2: Commit**

```bash
git add scripts/setup-data-model/src/relations.ts
git commit -m "feat: all 16 cross-object relation definitions"
```

---

## Task 4: Main Orchestrator Script

**Files:**
- Create: `scripts/setup-data-model/src/index.ts`

- [ ] **Step 1: Implement the orchestrator**

```typescript
// scripts/setup-data-model/src/index.ts
// Idempotent setup script — safe to re-run
import { MetadataClient } from "./metadata-client.js";
import { TENANT_OBJECT } from "./objects/tenant.js";
import { LANDLORD_OBJECT } from "./objects/landlord.js";
import { PROPERTY_OBJECT } from "./objects/property.js";
import { ROOM_OBJECT } from "./objects/room.js";
import { CONTRACT_OBJECT } from "./objects/contract.js";
import { TICKET_OBJECT } from "./objects/ticket.js";
import { PEOPLE_EXTENSIONS } from "./extensions/people.js";
import { OPPORTUNITY_EXTENSIONS } from "./extensions/opportunity.js";
import { RELATIONS } from "./relations.js";
import type { ObjectDefinition, FieldDefinition } from "./types.js";

const TWENTY_URL = process.env.TWENTY_URL || "http://localhost:3000";
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

if (!TWENTY_API_KEY) {
  console.error("Error: TWENTY_API_KEY environment variable required");
  console.error("Usage: TWENTY_API_KEY=<key> npm start");
  process.exit(1);
}

const client = new MetadataClient(TWENTY_URL, TWENTY_API_KEY);

async function createCustomObject(def: ObjectDefinition): Promise<string> {
  console.log(`\nCreating object: ${def.labelSingular}`);
  const obj = await client.createObject({
    nameSingular: def.nameSingular,
    namePlural: def.namePlural,
    labelSingular: def.labelSingular,
    labelPlural: def.labelPlural,
    icon: def.icon,
    description: def.description,
  });

  // Create fields
  for (const field of def.fields) {
    await client.createField(obj.id, field);
  }

  return obj.id;
}

async function extendStandardObject(objectName: string, fields: FieldDefinition[]): Promise<void> {
  console.log(`\nExtending object: ${objectName}`);
  const obj = await client.findObjectByName(objectName);
  if (!obj) {
    console.error(`  Standard object "${objectName}" not found!`);
    return;
  }

  for (const field of fields) {
    await client.createField(obj.id, field);
  }
}

async function createRelations(objectIds: Record<string, string>): Promise<void> {
  console.log("\nCreating relations...");
  for (const rel of RELATIONS) {
    const fromId = objectIds[rel.fromObject];
    const toId = objectIds[rel.toObject];
    if (!fromId || !toId) {
      console.error(`  Skipping relation ${rel.fromField}: missing object ID for ${rel.fromObject} or ${rel.toObject}`);
      continue;
    }
    await client.createRelation(
      fromId, toId,
      rel.fromField, rel.toField,
      rel.fromLabel, rel.toLabel
    );
  }
}

async function main(): Promise<void> {
  console.log("=== Flent Twenty Data Model Setup ===");
  console.log(`Target: ${TWENTY_URL}`);

  // Step 1: Extend standard objects (People, Opportunity)
  await extendStandardObject("person", PEOPLE_EXTENSIONS);
  await extendStandardObject("opportunity", OPPORTUNITY_EXTENSIONS);

  // Step 2: Create custom objects with fields
  const objectIds: Record<string, string> = {};

  // Get standard object IDs
  const person = await client.findObjectByName("person");
  const opportunity = await client.findObjectByName("opportunity");
  if (person) objectIds["person"] = person.id;
  if (opportunity) objectIds["opportunity"] = opportunity.id;

  const customObjects = [
    TENANT_OBJECT,
    LANDLORD_OBJECT,
    PROPERTY_OBJECT,
    ROOM_OBJECT,
    CONTRACT_OBJECT,
    TICKET_OBJECT,
  ];

  for (const def of customObjects) {
    objectIds[def.nameSingular] = await createCustomObject(def);
  }

  console.log("\nObject IDs:", objectIds);

  // Step 3: Create relations
  await createRelations(objectIds);

  console.log("\n=== Data Model Setup Complete ===");
  console.log(`Created ${customObjects.length} custom objects`);
  console.log(`Extended 2 standard objects`);
  console.log(`Created ${RELATIONS.length} relations`);
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Test run against live Twenty**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra/scripts/setup-data-model
TWENTY_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZTA3ZWJhMC03ZDMxLTQ5OWEtOTEyZi04MTZmYzQyZDk4N2UiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiYWUwN2ViYTAtN2QzMS00OTlhLTkxMmYtODE2ZmM0MmQ5ODdlIiwiaWF0IjoxNzc1NzI5ODQ0LCJleHAiOjQ5MjkzMjk4NDMsImp0aSI6IjQyYWE3Y2UyLTllYWItNGVhZi1iNWEyLWZjOWIxNjA0NGFlMyJ9.EZXmYVvldInp__95gnM45Lk28Ol7eNGHFQ42QxV9go8" npm start
```

Expected output:
```
=== Flent Twenty Data Model Setup ===
Target: http://localhost:3000

Extending object: person
    Created field "role" (MULTI_SELECT)
    Created field "aadharNumber" (TEXT)
    ...

Creating object: Tenant
  Created object "tenant" (uuid...)
    Created field "customerStatus" (SELECT)
    Created field "tenantLifecycle" (SELECT)
    ...

Creating relations...
    Created relation: person -> tenant
    ...

=== Data Model Setup Complete ===
Created 6 custom objects
Extended 2 standard objects
Created 16 relations
```

- [ ] **Step 3: Verify in Twenty UI**

Open http://localhost:3000 and check:
- Settings -> Data Model should show 6 new custom objects
- Each object should have all fields visible
- Relations should show linked objects

- [ ] **Step 4: Commit**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra
git add scripts/setup-data-model/
git commit -m "feat: data model setup script — creates 6 objects, ~150 fields, 16 relations against live Twenty"
```

---

## Task 5: Update HubSpot Mirror for Custom Objects

**Files:**
- Modify: `functions/hubspot-mirror/src/twenty-client.ts`
- Modify: `functions/hubspot-mirror/src/field-mapping.ts`
- Modify: `functions/hubspot-mirror/src/index.ts`

The mirror currently upserts People and Opportunities (standard objects). Now update it to also create Tenant, Landlord, Property, Room, Contract, and Ticket records in the custom objects.

- [ ] **Step 1: Update twenty-client.ts with real upsert mutations for custom objects**

The Twenty GraphQL API at `/graphql` (not `/metadata`) uses auto-generated mutations based on the custom objects. After running the data model setup, mutations like `createTenant`, `createLandlord`, `createProperty`, etc. become available.

Update `twenty-client.ts` to:
1. Add `upsertTenant(data)` — creates/updates Tenant record with person relation
2. Add `upsertLandlord(data)` — creates/updates Landlord record with person relation
3. Add `upsertProperty(data)` — creates/updates Property record
4. Add `upsertRoom(data)` — creates/updates Room record with property relation
5. Add `upsertContract(data)` — creates/updates Contract record with all relations
6. Add `upsertTicket(data)` — creates/updates Ticket record with relations

Each upsert should:
- Check if a record with the same `hubspotRecordId` already exists (search query)
- If exists: update it
- If not: create it
- Handle relation linking by ID lookup

- [ ] **Step 2: Update field-mapping.ts for custom object field names**

The current mappers output generic field names. Update them to match the exact Twenty custom object field names (camelCase) created by the setup script.

- [ ] **Step 3: Update index.ts to call custom object upserts**

Replace the placeholder `console.log("[Phase 2]...")` stubs with actual upsert calls.

- [ ] **Step 4: Run tests — verify all 45+ tests still pass**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra/functions/hubspot-mirror
npx vitest run
```

- [ ] **Step 5: Redeploy mirror Cloud Function**

```bash
npm run build
GOOGLE_APPLICATION_CREDENTIALS="" gcloud functions deploy hubspot-mirror \
  --gen2 --runtime=nodejs20 --region=asia-south1 --source=. \
  --entry-point=hubspotMirror --trigger-http --no-allow-unauthenticated \
  --service-account=flent-cloud-functions@flent-twenty-prod.iam.gserviceaccount.com \
  --memory=512MB --timeout=300s --project=flent-twenty-prod
```

- [ ] **Step 6: Trigger mirror manually and verify data**

```bash
# Trigger the mirror
GOOGLE_APPLICATION_CREDENTIALS="" gcloud functions call hubspot-mirror --gen2 --region=asia-south1 --project=flent-twenty-prod

# Then check Twenty for data
curl -s -H "Authorization: Bearer $TWENTY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ tenants(first: 1) { totalCount } landlords(first: 1) { totalCount } properties(first: 1) { totalCount } rooms(first: 1) { totalCount } contracts(first: 1) { totalCount } }"}' \
  http://localhost:3000/graphql
```

Expected: Record counts matching HubSpot (~4000 tenants, ~200 landlords, ~196 properties, ~74 rooms, ~1199 contracts)

- [ ] **Step 7: Commit**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra
git add functions/hubspot-mirror/
git commit -m "feat: mirror now populates all custom objects — Tenant, Landlord, Property, Room, Contract, Ticket"
```

---

## Task 6: View Configuration Script

**Files:**
- Create: `scripts/setup-views/src/index.ts`
- Create: `scripts/setup-views/src/view-definitions.ts`
- Create: `scripts/setup-views/package.json`

Creates all 17 views from spec Section 7 via the Twenty API.

- [ ] **Step 1: Create view definitions**

```typescript
// scripts/setup-views/src/view-definitions.ts
export interface ViewDefinition {
  name: string;
  objectName: string;
  type: "table" | "kanban";
  filters: Array<{
    fieldName: string;
    operand: "is" | "isNot" | "lessThan" | "greaterThan" | "contains";
    value: string;
  }>;
  icon: string;
}

export const VIEWS: ViewDefinition[] = [
  { name: "Active Tenants", objectName: "tenant", type: "table", icon: "IconUser",
    filters: [{ fieldName: "customerStatus", operand: "is", value: "ACTIVE" }] },
  { name: "Move-out Next 15 Days", objectName: "tenant", type: "table", icon: "IconCalendarOff",
    filters: [{ fieldName: "customerStatus", operand: "is", value: "ACTIVE" }] },
  { name: "Overdue Rent", objectName: "tenant", type: "table", icon: "IconAlertTriangle",
    filters: [{ fieldName: "rentStatus", operand: "is", value: "OVERDUE" }] },
  { name: "Active Landlords", objectName: "landlord", type: "table", icon: "IconBuildingSkyscraper",
    filters: [{ fieldName: "landlordStatus", operand: "is", value: "ACTIVE" }] },
  { name: "Reserve Pipeline", objectName: "opportunity", type: "kanban", icon: "IconTarget",
    filters: [{ fieldName: "pipelineType", operand: "is", value: "RESERVE" }] },
  { name: "Occupancy Pipeline", objectName: "opportunity", type: "kanban", icon: "IconHome",
    filters: [{ fieldName: "pipelineType", operand: "is", value: "OCCUPANCY" }] },
  { name: "F4B Pipeline", objectName: "opportunity", type: "kanban", icon: "IconBriefcase",
    filters: [{ fieldName: "pipelineType", operand: "is", value: "F4B" }] },
  { name: "Supply Pipeline", objectName: "opportunity", type: "kanban", icon: "IconBuilding",
    filters: [{ fieldName: "pipelineType", operand: "is", value: "SUPPLY" }] },
  { name: "Open Support Tickets", objectName: "ticket", type: "table", icon: "IconHeadset",
    filters: [{ fieldName: "pipeline", operand: "is", value: "SUPPORT" }] },
  { name: "Landlord Tickets", objectName: "ticket", type: "table", icon: "IconTicket",
    filters: [{ fieldName: "pipeline", operand: "is", value: "LANDLORD" }] },
  { name: "Expiring Contracts", objectName: "contract", type: "table", icon: "IconFileText",
    filters: [{ fieldName: "state", operand: "is", value: "ACTIVE" }] },
  { name: "Vacant Rooms", objectName: "room", type: "table", icon: "IconDoor",
    filters: [{ fieldName: "status", operand: "is", value: "VACANT" }] },
  { name: "Properties by Area", objectName: "property", type: "table", icon: "IconMap",
    filters: [] },
  { name: "My Tenants", objectName: "tenant", type: "table", icon: "IconUserCircle",
    filters: [] },
  { name: "My Landlords", objectName: "landlord", type: "table", icon: "IconUserCircle",
    filters: [] },
  { name: "My Properties", objectName: "property", type: "table", icon: "IconUserCircle",
    filters: [] },
  { name: "My Landlord Contracts", objectName: "contract", type: "table", icon: "IconUserCircle",
    filters: [{ fieldName: "contractType", operand: "is", value: "LANDLORD_AGREEMENT" }] },
];
```

- [ ] **Step 2: Implement view creation script**

The script calls Twenty's view creation API for each view definition. Views in Twenty are created via the core GraphQL API (not metadata).

- [ ] **Step 3: Run against live Twenty**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra/scripts/setup-views
TWENTY_API_KEY="..." npm start
```

- [ ] **Step 4: Verify views in Twenty UI**

Open http://localhost:3000 and check each object's view dropdown — all 17 views should appear.

- [ ] **Step 5: Commit**

```bash
cd /Users/atrishabh/Documents/Dev/flent-infra
git add scripts/setup-views/
git commit -m "feat: 17 view definitions — pipelines, active tenants, overdue rent, vacant rooms, etc."
```

---

## Task 7: RBAC Configuration

**Files:**
- Create: `scripts/setup-rbac/src/index.ts`

Creates the 9 roles from spec Section 6 with object-level, field-level, and settings permissions.

This task creates roles via Twenty's Settings API or metadata API:
1. Admin, PSM, CX Associate, Leasing Agent, Supply Agent, F4B Sales, Maintenance, Finance, Management
2. Object-level permissions (See/Edit/No per object per role)
3. Field-level permissions (sensitive fields: Aadhaar, PAN, bank details)
4. Settings permissions (API keys, workflows, data model — Admin only)

- [ ] **Step 1: Create RBAC setup script**

The script uses Twenty's role/permission API to create all 9 roles with the permission matrices from spec Section 6.2-6.4.

- [ ] **Step 2: Run against live Twenty**

```bash
TWENTY_API_KEY="..." npm start
```

- [ ] **Step 3: Verify in Twenty UI**

Settings -> Roles should show all 9 roles with correct permissions.

- [ ] **Step 4: Commit**

```bash
git add scripts/setup-rbac/
git commit -m "feat: 9 RBAC roles with object, field, and settings permissions"
```

---

## Task 8: Metabase Dashboard Setup

**Files:**
- Create: `scripts/setup-metabase/src/index.ts`

Configures Metabase:
1. Add Twenty PostgreSQL data source (read replica via localhost:5432)
2. Create 5 starter dashboards with SQL queries:
   - Occupancy Overview (rooms occupied vs total, by property, by area)
   - Revenue by Property (monthly rent collected, trend)
   - Pipeline Funnel (Reserve → Occupancy → Move-in conversion)
   - Ticket SLA (open > 7 days, resolution time)
   - Lease Expiry Calendar (contracts expiring in 30/60/90 days)

Uses Metabase's API at `http://localhost:3001/api/` (port-forwarded).

- [ ] **Step 1: Implement Metabase setup script with SQL queries for each dashboard**

- [ ] **Step 2: Run against live Metabase**

- [ ] **Step 3: Verify 5 dashboards visible in Metabase UI**

- [ ] **Step 4: Commit**

```bash
git add scripts/setup-metabase/
git commit -m "feat: 5 Metabase dashboards — occupancy, revenue, pipeline, tickets, lease expiry"
```

---

## Phase 2 Exit Criteria Checklist

- [ ] 6 custom objects created (Tenant, Landlord, Property, Room, Contract, Ticket)
- [ ] 2 standard objects extended (People + Opportunity) with custom fields
- [ ] ~150 fields created across all objects
- [ ] 16 cross-object relations configured
- [ ] All SELECT/MULTI_SELECT fields have correct options
- [ ] 17 views configured and loading
- [ ] 9 RBAC roles with permissions
- [ ] HubSpot mirror populating data into all custom objects
- [ ] Record counts match HubSpot (16,853 total)
- [ ] 5 Metabase dashboards live
- [ ] All pushed to flent-homes/twenty GitHub repo
