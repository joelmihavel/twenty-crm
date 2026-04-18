import { getEffectiveApiKey } from "@/lib/auth";

function getGraphQLUrl(): string {
  // Client-side: always use the proxy route to avoid exposing API keys
  if (typeof window !== "undefined") {
    return "/bff";
  }
  // Server-side: use env var directly (never expose to client)
  const url = process.env.TWENTY_GRAPHQL_URL;
  if (!url) {
    throw new Error("TWENTY_GRAPHQL_URL environment variable is not set");
  }
  return url;
}

export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  apiKey?: string,
): Promise<T> {
  const url = getGraphQLUrl();
  const isProxy = url.startsWith("/");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only send Authorization header when calling Twenty directly (server-side)
  // The proxy route reads the cookie/env var itself
  if (!isProxy) {
    const key = apiKey || getEffectiveApiKey();
    headers["Authorization"] = `Bearer ${key}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
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

function getMetadataUrl(): string {
  if (typeof window !== "undefined") {
    return "/bff/metadata";
  }
  const url = process.env.TWENTY_METADATA_URL;
  if (!url) {
    throw new Error("TWENTY_METADATA_URL environment variable is not set");
  }
  return url;
}

export async function metadataQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  apiKey?: string,
): Promise<T> {
  const url = getMetadataUrl();
  const isProxy = url.startsWith("/");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isProxy) {
    const key = apiKey || getEffectiveApiKey();
    headers["Authorization"] = `Bearer ${key}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Metadata API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Metadata error: ${json.errors.map((e: { message: string }) => e.message).join("; ")}`);
  }
  return json.data;
}
