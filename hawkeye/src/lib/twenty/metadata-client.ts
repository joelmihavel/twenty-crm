import { getEffectiveApiKey } from "@/lib/auth";
import type { ObjectMetadata, FieldMetadata } from "./types";

function getMetadataUrl(): string {
  // Client-side: always use the proxy route to avoid exposing API keys
  if (typeof window !== "undefined") {
    return "/api/twenty/metadata";
  }
  // Server-side: use env var directly
  const url = process.env.TWENTY_METADATA_URL;
  if (!url) {
    throw new Error("TWENTY_METADATA_URL environment variable is not set");
  }
  return url;
}

// Module-level cache for objects
let cachedObjectsData: ObjectMetadata[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

async function metadataQuery<T>(query: string): Promise<T> {
  const url = getMetadataUrl();
  const isProxy = url.startsWith("/");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only send Authorization header when calling Twenty directly (server-side)
  if (!isProxy) {
    const key = getEffectiveApiKey();
    headers["Authorization"] = `Bearer ${key}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
    cache: "no-store",
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
  // Return cached data if still valid
  if (cachedObjectsData && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedObjectsData;
  }

  // Step 1: Fetch objects (without nested fields — nested paging caps globally)
  const objectsQuery = `{
    objects(paging: { first: 100 }, filter: { isActive: { is: true } }) {
      edges {
        node {
          id nameSingular namePlural labelSingular labelPlural icon isCustom isActive
        }
      }
    }
  }`;

  // Step 2: Fetch ALL fields via top-level query (avoids nested paging cap)
  const fieldsQuery = `{
    fields(paging: { first: 5000 }) {
      edges {
        node {
          id name label type isCustom isActive options defaultValue description
          object { nameSingular isActive }
        }
      }
    }
  }`;

  interface FieldApiNode extends FieldMetadata {
    isActive: boolean;
    object: { nameSingular: string; isActive: boolean };
  }

  const [objectsData, fieldsData] = await Promise.all([
    metadataQuery<{
      objects: { edges: { node: Omit<ObjectMetadata, "fields"> }[] };
    }>(objectsQuery),
    metadataQuery<{
      fields: { edges: { node: FieldApiNode }[] };
    }>(fieldsQuery),
  ]);

  // Group fields by object nameSingular
  const fieldsByObject = new Map<string, FieldMetadata[]>();
  for (const edge of fieldsData.fields.edges) {
    const field = edge.node;
    if (!field.isActive || !field.object.isActive) continue;
    const objName = field.object.nameSingular;
    if (!fieldsByObject.has(objName)) {
      fieldsByObject.set(objName, []);
    }
    fieldsByObject.get(objName)!.push({
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      isCustom: field.isCustom,
      options: field.options,
      defaultValue: field.defaultValue,
      description: field.description,
    });
  }

  // Join objects with their fields
  const results: ObjectMetadata[] = objectsData.objects.edges.map((edge) => ({
    ...edge.node,
    fields: fieldsByObject.get(edge.node.nameSingular) ?? [],
  }));

  // Update cache
  cachedObjectsData = results;
  cacheTimestamp = Date.now();

  return results;
}

export async function fetchObjectByName(nameSingular: string): Promise<ObjectMetadata | null> {
  // Use cached objects instead of refetching
  const all = await fetchAllObjects();
  return all.find((o) => o.nameSingular === nameSingular) ?? null;
}
