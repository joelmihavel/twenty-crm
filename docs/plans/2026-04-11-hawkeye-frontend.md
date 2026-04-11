# Hawkeye: Schema-Driven CRM Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully dynamic, schema-driven CRM frontend using Untitled UI Pro that auto-renders tables, forms, kanban, filters, and record detail from Twenty's metadata API — no code changes when objects/fields are added.

**Architecture:** Next.js 16 app using Untitled UI Pro components. At runtime, it fetches object metadata from Twenty's `/metadata` GraphQL endpoint to discover objects and fields, then dynamically builds table columns, form inputs, filter operators, and detail views. Twenty serves as headless API only. Nginx routes `hawkeye.flent.in/` to Next.js, `hawkeye.flent.in/crmops/` to Twenty's native UI.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4.2, Untitled UI Pro, React Aria Components, Apollo Client (GraphQL), @dnd-kit (kanban drag-drop)

**Starter Kit:** `/Users/atrishabh/Documents/Dev/Twenty/untitledui-nextjs-starter-kit/`

**Twenty APIs:**
- Metadata API: `https://hawkeye.flent.in/metadata` (GraphQL — object/field definitions)
- Core API: `https://hawkeye.flent.in/graphql` (GraphQL — CRUD records)
- API Key: stored in env var `TWENTY_API_KEY`

**Twenty Field Types (25):** ACTOR, ADDRESS, ARRAY, BOOLEAN, CURRENCY, DATE, DATE_TIME, EMAILS, FILES, FULL_NAME, LINKS, MORPH_RELATION, MULTI_SELECT, NUMBER, NUMERIC, PHONES, POSITION, RATING, RAW_JSON, RELATION, RICH_TEXT, SELECT, TEXT, TS_VECTOR, UUID

---

## Sub-Plan Overview

| Sub-Plan | What | Depends On | Effort |
|----------|------|-----------|--------|
| **1. Core Engine** | Metadata client, field type registry, dynamic renderers | Nothing | 2-3 days |
| **2. Dynamic Views** | Table, kanban, calendar, record detail, filters | Core Engine | 3-4 days |
| **3. Navigation & Auth** | Sidebar, routing, auth, command palette, settings | Core Engine | 2 days |
| **4. Infrastructure** | Nginx routing, GKE deployment, domain config | Nothing (parallel) | 1 day |

**Total: 8-10 days with Claude Code**

---

## Sub-Plan 1: Core Engine

### File Structure

```
src/
├── lib/
│   ├── twenty/
│   │   ├── metadata-client.ts      # Fetches object/field metadata from /metadata
│   │   ├── graphql-client.ts       # Apollo client for /graphql (CRUD)
│   │   ├── query-builder.ts        # Dynamically builds GraphQL queries from metadata
│   │   ├── types.ts                # TypeScript types for metadata objects
│   │   └── field-type-registry.ts  # Maps Twenty field types -> renderers
│   └── hooks/
│       ├── use-metadata.ts         # React hook: fetch + cache all object metadata
│       ├── use-object-records.ts   # React hook: fetch records for an object
│       ├── use-create-record.ts    # React hook: create a record
│       ├── use-update-record.ts    # React hook: update a record
│       └── use-delete-record.ts    # React hook: delete a record
├── components/
│   └── fields/
│       ├── field-renderer.tsx      # Dynamic dispatcher: type -> display component
│       ├── field-editor.tsx        # Dynamic dispatcher: type -> input component
│       ├── renderers/
│       │   ├── text-renderer.tsx
│       │   ├── currency-renderer.tsx
│       │   ├── select-renderer.tsx
│       │   ├── date-renderer.tsx
│       │   ├── boolean-renderer.tsx
│       │   ├── email-renderer.tsx
│       │   ├── phone-renderer.tsx
│       │   ├── relation-renderer.tsx
│       │   ├── rating-renderer.tsx
│       │   ├── links-renderer.tsx
│       │   ├── fullname-renderer.tsx
│       │   └── multiselect-renderer.tsx
│       └── editors/
│           ├── text-editor.tsx
│           ├── currency-editor.tsx
│           ├── select-editor.tsx
│           ├── date-editor.tsx
│           ├── boolean-editor.tsx
│           ├── email-editor.tsx
│           ├── phone-editor.tsx
│           ├── relation-editor.tsx
│           ├── rating-editor.tsx
│           ├── links-editor.tsx
│           ├── fullname-editor.tsx
│           └── multiselect-editor.tsx
```

---

### Task 1: Twenty API Client Layer

**Files:**
- Create: `src/lib/twenty/types.ts`
- Create: `src/lib/twenty/metadata-client.ts`
- Create: `src/lib/twenty/graphql-client.ts`

- [ ] **Step 1: Define TypeScript types for metadata**

```typescript
// src/lib/twenty/types.ts

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

// Fields to exclude from user-facing views (internal/system fields)
export const SYSTEM_FIELD_TYPES: FieldType[] = [
  "ACTOR", "POSITION", "TS_VECTOR", "UUID",
];

export const SYSTEM_FIELD_NAMES = [
  "id", "createdAt", "updatedAt", "deletedAt",
  "createdBy", "updatedBy", "position", "searchVector",
];
```

- [ ] **Step 2: Create metadata client**

```typescript
// src/lib/twenty/metadata-client.ts

import type { ObjectMetadata, FieldMetadata } from "./types";

const METADATA_URL = process.env.NEXT_PUBLIC_TWENTY_METADATA_URL || "https://hawkeye.flent.in/metadata";
const API_KEY = process.env.TWENTY_API_KEY || "";

async function metadataQuery<T>(query: string): Promise<T> {
  const res = await fetch(METADATA_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 60 }, // Cache metadata for 60 seconds (ISR)
  });

  if (!res.ok) {
    throw new Error(`Metadata API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Metadata GraphQL error: ${json.errors[0].message}`);
  }
  return json.data;
}

export async function fetchAllObjects(): Promise<ObjectMetadata[]> {
  const query = `{
    objects(paging: { first: 100 }, filter: { isActive: { is: true } }) {
      edges {
        node {
          id nameSingular namePlural labelSingular labelPlural icon isCustom isActive
          fields(paging: { first: 200 }) {
            edges {
              node {
                id name label type isCustom options defaultValue description
              }
            }
          }
        }
      }
    }
  }`;

  const data = await metadataQuery<{
    objects: { edges: { node: ObjectMetadata & { fields: { edges: { node: FieldMetadata }[] } } }[] };
  }>(query);

  return data.objects.edges.map((edge) => ({
    ...edge.node,
    fields: edge.node.fields.edges.map((f) => f.node),
  }));
}

export async function fetchObjectByName(nameSingular: string): Promise<ObjectMetadata | null> {
  const all = await fetchAllObjects();
  return all.find((o) => o.nameSingular === nameSingular) ?? null;
}
```

- [ ] **Step 3: Create GraphQL client for record CRUD**

```typescript
// src/lib/twenty/graphql-client.ts

const GRAPHQL_URL = process.env.NEXT_PUBLIC_TWENTY_GRAPHQL_URL || "https://hawkeye.flent.in/graphql";

export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  apiKey?: string,
): Promise<T> {
  const key = apiKey || process.env.TWENTY_API_KEY || "";
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors.map((e: { message: string }) => e.message).join("; ")}`);
  }
  return json.data;
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/atrishabh/Documents/Dev/Twenty/untitledui-nextjs-starter-kit
git add src/lib/twenty/
git commit -m "feat: Twenty API client layer — metadata + graphql clients, types"
```

---

### Task 2: Dynamic Query Builder

**Files:**
- Create: `src/lib/twenty/query-builder.ts`

- [ ] **Step 1: Implement query builder that generates GraphQL from metadata**

```typescript
// src/lib/twenty/query-builder.ts

import type { FieldMetadata, FieldType, ObjectMetadata } from "./types";
import { SYSTEM_FIELD_TYPES, SYSTEM_FIELD_NAMES } from "./types";

/** Get user-visible fields (exclude system/internal) */
export function getVisibleFields(object: ObjectMetadata): FieldMetadata[] {
  return object.fields.filter(
    (f) =>
      !SYSTEM_FIELD_TYPES.includes(f.type) &&
      !SYSTEM_FIELD_NAMES.includes(f.name) &&
      f.type !== "RELATION" && // Relations need special handling
      f.type !== "MORPH_RELATION",
  );
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/twenty/query-builder.ts
git commit -m "feat: dynamic GraphQL query builder — generates queries from metadata"
```

---

### Task 3: React Hooks for Metadata + Records

**Files:**
- Create: `src/lib/hooks/use-metadata.ts`
- Create: `src/lib/hooks/use-object-records.ts`
- Create: `src/lib/hooks/use-create-record.ts`
- Create: `src/lib/hooks/use-update-record.ts`
- Create: `src/lib/hooks/use-delete-record.ts`

- [ ] **Step 1: Create metadata hook with SWR-like caching**

```typescript
// src/lib/hooks/use-metadata.ts
"use client";

import { useEffect, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { fetchAllObjects } from "../twenty/metadata-client";

let cachedObjects: ObjectMetadata[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

export function useMetadata() {
  const [objects, setObjects] = useState<ObjectMetadata[]>(cachedObjects ?? []);
  const [loading, setLoading] = useState(!cachedObjects);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cachedObjects && Date.now() - cacheTimestamp < CACHE_TTL) {
      setObjects(cachedObjects);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAllObjects()
      .then((data) => {
        cachedObjects = data;
        cacheTimestamp = Date.now();
        setObjects(data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const getObject = (nameSingular: string) =>
    objects.find((o) => o.nameSingular === nameSingular) ?? null;

  const getNavigableObjects = () =>
    objects.filter((o) => o.isActive && !["calendarEvent", "calendarChannel", "calendarChannelEventAssociation", "calendarEventParticipant", "messageChannel", "messageChannelMessageAssociation", "messageChannelMessageAssociationMessageFolder", "messageFolder", "messageParticipant", "messageThread", "message", "blocklist", "connectedAccount", "timelineActivity", "workflowVersion", "workflowAutomatedTrigger", "workflowRun", "workflow", "attachment", "noteTarget", "taskTarget", "favorite", "favoriteFolder", "dashboard"].includes(o.nameSingular));

  return { objects, loading, error, getObject, getNavigableObjects };
}
```

- [ ] **Step 2: Create records hook**

```typescript
// src/lib/hooks/use-object-records.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { ObjectMetadata, RecordData } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildListQuery } from "../twenty/query-builder";

interface UseObjectRecordsOptions {
  first?: number;
  filter?: Record<string, unknown>;
  orderBy?: { field: string; direction: "AscNullsFirst" | "DescNullsFirst" };
}

interface UseObjectRecordsResult {
  records: RecordData[];
  totalCount: number;
  loading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  refetch: () => void;
  loadMore: () => void;
}

export function useObjectRecords(
  object: ObjectMetadata | null,
  options: UseObjectRecordsOptions = {},
): UseObjectRecordsResult {
  const [records, setRecords] = useState<RecordData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>();

  const fetchRecords = useCallback(async (append = false) => {
    if (!object) return;
    setLoading(true);
    setError(null);

    try {
      const query = buildListQuery(object, {
        first: options.first ?? 50,
        after: append ? endCursor : undefined,
        filter: options.filter,
        orderBy: options.orderBy,
      });

      const data = await graphqlQuery<Record<string, {
        edges: { node: RecordData }[];
        totalCount: number;
        pageInfo: { hasNextPage: boolean; endCursor: string };
      }>>(query);

      const result = data[object.namePlural];
      const newRecords = result.edges.map((e) => e.node);

      setRecords(append ? [...records, ...newRecords] : newRecords);
      setTotalCount(result.totalCount);
      setHasNextPage(result.pageInfo.hasNextPage);
      setEndCursor(result.pageInfo.endCursor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [object, options.first, options.filter, options.orderBy, endCursor, records]);

  useEffect(() => {
    fetchRecords(false);
  }, [object?.id, JSON.stringify(options.filter), JSON.stringify(options.orderBy)]);

  return {
    records,
    totalCount,
    loading,
    error,
    hasNextPage,
    refetch: () => fetchRecords(false),
    loadMore: () => fetchRecords(true),
  };
}
```

- [ ] **Step 3: Create mutation hooks**

```typescript
// src/lib/hooks/use-create-record.ts
"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildCreateMutation } from "../twenty/query-builder";

export function useCreateRecord(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createRecord = useCallback(async (data: Record<string, unknown>): Promise<string | null> => {
    if (!object) return null;
    setLoading(true);
    setError(null);

    try {
      const mutation = buildCreateMutation(object);
      const typeName = object.nameSingular.charAt(0).toUpperCase() + object.nameSingular.slice(1);
      const result = await graphqlQuery<Record<string, { id: string }>>(mutation, { data });
      return result[`create${typeName}`].id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, [object]);

  return { createRecord, loading, error };
}
```

```typescript
// src/lib/hooks/use-update-record.ts
"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildUpdateMutation } from "../twenty/query-builder";

export function useUpdateRecord(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateRecord = useCallback(async (id: string, data: Record<string, unknown>): Promise<boolean> => {
    if (!object) return false;
    setLoading(true);
    setError(null);

    try {
      const mutation = buildUpdateMutation(object);
      await graphqlQuery(mutation, { id, data });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [object]);

  return { updateRecord, loading, error };
}
```

```typescript
// src/lib/hooks/use-delete-record.ts
"use client";

import { useCallback, useState } from "react";
import type { ObjectMetadata } from "../twenty/types";
import { graphqlQuery } from "../twenty/graphql-client";
import { buildDeleteMutation } from "../twenty/query-builder";

export function useDeleteRecord(object: ObjectMetadata | null) {
  const [loading, setLoading] = useState(false);

  const deleteRecord = useCallback(async (id: string): Promise<boolean> => {
    if (!object) return false;
    setLoading(true);
    try {
      const mutation = buildDeleteMutation(object);
      await graphqlQuery(mutation, { id });
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [object]);

  return { deleteRecord, loading };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/hooks/
git commit -m "feat: React hooks — useMetadata, useObjectRecords, useCreateRecord, useUpdateRecord, useDeleteRecord"
```

---

### Task 4: Field Type Registry + Dynamic Renderers

**Files:**
- Create: `src/lib/twenty/field-type-registry.ts`
- Create: `src/components/fields/field-renderer.tsx`
- Create: `src/components/fields/field-editor.tsx`
- Create: `src/components/fields/renderers/` (12 files)
- Create: `src/components/fields/editors/` (12 files)

- [ ] **Step 1: Create field type registry**

```typescript
// src/lib/twenty/field-type-registry.ts

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
```

- [ ] **Step 2: Create dynamic field renderer (display component)**

```typescript
// src/components/fields/field-renderer.tsx
"use client";

import type { FieldMetadata, CurrencyValue, FullNameValue, EmailsValue, PhonesValue, LinksValue, SelectOption } from "@/lib/twenty/types";
import { Badge } from "@/components/base/badges/badges";

interface FieldRendererProps {
  field: FieldMetadata;
  value: unknown;
}

export function FieldRenderer({ field, value }: FieldRendererProps) {
  if (value === null || value === undefined) {
    return <span className="text-fg-quaternary">—</span>;
  }

  switch (field.type) {
    case "TEXT":
      return <span className="truncate">{String(value)}</span>;

    case "NUMBER":
    case "NUMERIC":
      return <span className="tabular-nums">{Number(value).toLocaleString("en-IN")}</span>;

    case "BOOLEAN":
      return <span>{value ? "Yes" : "No"}</span>;

    case "DATE":
    case "DATE_TIME": {
      const date = new Date(value as string);
      return <span>{date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>;
    }

    case "CURRENCY": {
      const cv = value as CurrencyValue;
      if (!cv?.amountMicros) return <span className="text-fg-quaternary">—</span>;
      const amount = cv.amountMicros / 1_000_000;
      return <span className="tabular-nums">₹{amount.toLocaleString("en-IN")}</span>;
    }

    case "SELECT": {
      const optValue = String(value);
      const option = field.options?.find((o) => o.value === optValue);
      if (!option) return <span>{optValue}</span>;
      return <Badge size="sm" color={option.color as "success" | "error" | "warning" | "brand"}>{option.label}</Badge>;
    }

    case "MULTI_SELECT": {
      const values = value as string[];
      if (!Array.isArray(values) || values.length === 0) return <span className="text-fg-quaternary">—</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {values.map((v) => {
            const option = field.options?.find((o) => o.value === v);
            return <Badge key={v} size="sm">{option?.label ?? v}</Badge>;
          })}
        </div>
      );
    }

    case "FULL_NAME": {
      const fn = value as FullNameValue;
      return <span>{[fn?.firstName, fn?.lastName].filter(Boolean).join(" ") || "—"}</span>;
    }

    case "EMAILS": {
      const em = value as EmailsValue;
      return em?.primaryEmail ? (
        <a href={`mailto:${em.primaryEmail}`} className="text-brand-600 hover:underline truncate">{em.primaryEmail}</a>
      ) : <span className="text-fg-quaternary">—</span>;
    }

    case "PHONES": {
      const ph = value as PhonesValue;
      return ph?.primaryPhoneNumber ? (
        <a href={`tel:${ph.primaryPhoneNumber}`} className="text-brand-600 hover:underline">{ph.primaryPhoneNumber}</a>
      ) : <span className="text-fg-quaternary">—</span>;
    }

    case "LINKS": {
      const lk = value as LinksValue;
      return lk?.primaryLinkUrl ? (
        <a href={lk.primaryLinkUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline truncate">
          {lk.primaryLinkLabel || lk.primaryLinkUrl}
        </a>
      ) : <span className="text-fg-quaternary">—</span>;
    }

    case "RATING": {
      const rating = Number(value);
      return <span>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
    }

    default:
      return <span className="truncate">{JSON.stringify(value)}</span>;
  }
}
```

- [ ] **Step 3: Create dynamic field editor (input component)**

```typescript
// src/components/fields/field-editor.tsx
"use client";

import type { FieldMetadata, CurrencyValue, FullNameValue, EmailsValue, PhonesValue } from "@/lib/twenty/types";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Textarea } from "@/components/base/textarea/textarea";

interface FieldEditorProps {
  field: FieldMetadata;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  switch (field.type) {
    case "TEXT":
      return (
        <Input
          label={field.label}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "NUMBER":
    case "NUMERIC":
      return (
        <Input
          label={field.label}
          type="number"
          value={value != null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        />
      );

    case "BOOLEAN":
      return (
        <Checkbox
          isSelected={Boolean(value)}
          onChange={(checked) => onChange(checked)}
        >
          {field.label}
        </Checkbox>
      );

    case "DATE":
    case "DATE_TIME":
      return (
        <Input
          label={field.label}
          type={field.type === "DATE" ? "date" : "datetime-local"}
          value={(value as string)?.slice(0, field.type === "DATE" ? 10 : 16) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    case "CURRENCY": {
      const cv = value as CurrencyValue | null;
      return (
        <Input
          label={field.label}
          type="number"
          value={cv?.amountMicros ? String(cv.amountMicros / 1_000_000) : ""}
          onChange={(e) => {
            const num = Number(e.target.value);
            onChange(e.target.value ? { amountMicros: Math.round(num * 1_000_000), currencyCode: "INR" } : null);
          }}
        />
      );
    }

    case "SELECT":
      return (
        <Select
          label={field.label}
          selectedKey={(value as string) ?? null}
          onSelectionChange={(key) => onChange(key)}
        >
          {(field.options ?? []).map((opt) => (
            <Select.Item key={opt.value} id={opt.value}>{opt.label}</Select.Item>
          ))}
        </Select>
      );

    case "FULL_NAME": {
      const fn = (value as FullNameValue) ?? { firstName: "", lastName: "" };
      return (
        <div className="flex gap-2">
          <Input
            label="First Name"
            value={fn.firstName ?? ""}
            onChange={(e) => onChange({ ...fn, firstName: e.target.value })}
          />
          <Input
            label="Last Name"
            value={fn.lastName ?? ""}
            onChange={(e) => onChange({ ...fn, lastName: e.target.value })}
          />
        </div>
      );
    }

    case "EMAILS": {
      const em = (value as EmailsValue) ?? { primaryEmail: "" };
      return (
        <Input
          label={field.label}
          type="email"
          value={em.primaryEmail ?? ""}
          onChange={(e) => onChange({ primaryEmail: e.target.value })}
        />
      );
    }

    case "PHONES": {
      const ph = (value as PhonesValue) ?? { primaryPhoneNumber: "" };
      return (
        <Input
          label={field.label}
          type="tel"
          value={ph.primaryPhoneNumber ?? ""}
          onChange={(e) => onChange({ primaryPhoneNumber: e.target.value })}
        />
      );
    }

    case "RICH_TEXT":
      return (
        <Textarea
          label={field.label}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "RATING":
      return (
        <Input
          label={field.label}
          type="number"
          min={0}
          max={5}
          value={value != null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        />
      );

    default:
      return (
        <Input
          label={field.label}
          value={value != null ? String(value) : ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/twenty/field-type-registry.ts src/components/fields/
git commit -m "feat: field type registry + dynamic renderers/editors for all 25 field types"
```

---

## Sub-Plan 2: Dynamic Views (outlined — full detail in next plan)

### Task 5: Dynamic Table View
- Uses Untitled UI's `Table` component
- Reads metadata to generate columns dynamically
- Each cell uses `FieldRenderer` for display, `FieldEditor` for inline edit
- Sorting via column headers (calls `useObjectRecords` with `orderBy`)
- Pagination via Untitled UI's `Pagination` component
- Row selection with checkboxes
- Row actions dropdown (Edit, Delete)

### Task 6: Dynamic Record Detail (Slideout)
- Uses Untitled UI's `SlideoutMenu`
- Reads metadata to generate form fields dynamically
- Each field uses `FieldEditor`
- Save button calls `useUpdateRecord`
- Activity timeline at bottom

### Task 7: Dynamic Create Form (Modal)
- Uses Untitled UI's `Modal`
- Auto-generates form from metadata
- Uses `useCreateRecord` on submit

### Task 8: Dynamic Filter Bar
- Uses Untitled UI's `FilterBar` + `FilterDropdownMenu`
- Auto-generates filter options from metadata
- Uses `FIELD_TYPE_REGISTRY.filterOperators` for operator list
- Builds GraphQL filter object from selections

### Task 9: Kanban Board View
- Uses `@dnd-kit/react` for drag-drop
- Columns driven by a SELECT field (user chooses which field = columns)
- Cards use `FieldRenderer` for display
- Drag between columns updates the SELECT field value

### Task 10: Calendar View
- Uses Untitled UI's `RangeCalendar` as base
- Overlay events from records that have DATE/DATE_TIME fields
- Click event opens record detail slideout

---

## Sub-Plan 3: Navigation & Auth (outlined)

### Task 11: Sidebar Navigation
- Uses Untitled UI's `SidebarNavigation`
- Dynamically populated from `useMetadata().getNavigableObjects()`
- Each object = one nav item with icon + label
- Active state from URL

### Task 12: Dynamic Routing
- Next.js App Router: `/[objectSlug]` → table view
- `/[objectSlug]/[recordId]` → record detail
- `/[objectSlug]?view=kanban` → kanban
- `/[objectSlug]?view=calendar` → calendar

### Task 13: Auth
- Login page using Untitled UI's auth templates
- Session management via Twenty's auth API
- API key stored in httpOnly cookie

### Task 14: Command Palette
- `Cmd+K` opens modal with Untitled UI's `ComboBox`
- Search across all objects and records via Twenty's search API
- Navigate to results

---

## Sub-Plan 4: Infrastructure (outlined)

### Task 15: Nginx Routing
- `/` → Next.js app (port 3001)
- `/crmops/` → Twenty native UI (port 3000)
- Both on hawkeye.flent.in via the same nginx-tls proxy

### Task 16: GKE Deployment
- Next.js app as Docker container on GKE
- Environment variables for API keys
- HPA auto-scaling

---

## Phase 1 Exit Criteria

- [ ] Navigate to any object via sidebar → table auto-renders with correct columns
- [ ] Add a field in CRM Ops → refresh → new column appears automatically
- [ ] Create a new object in CRM Ops → refresh → new nav item + table view works
- [ ] Inline edit a cell → value saves to Twenty
- [ ] Create record via modal → appears in table
- [ ] Delete record via row action → disappears from table
- [ ] Filter records → table updates
- [ ] Sort by column → table reorders
- [ ] Kanban view for SELECT fields → drag cards between columns
- [ ] Calendar view for DATE fields → shows events on calendar
- [ ] Cmd+K search → navigate to record
- [ ] 40 users can access simultaneously
- [ ] HTTPS via Cloudflare + origin cert
