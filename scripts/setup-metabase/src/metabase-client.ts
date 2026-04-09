/**
 * Metabase REST API client.
 *
 * Handles authentication, database configuration, card (question) creation,
 * dashboard creation, and dashboard card placement.
 */

// ── Config ──────────────────────────────────────────────────────────────────

const METABASE_URL = process.env.METABASE_URL ?? "http://localhost:3001";
const API = `${METABASE_URL}/api`;

// ── Types ───────────────────────────────────────────────────────────────────

export interface MetabaseSession {
  id: string;
}

export interface SetupProperties {
  "setup-token": string | null;
  [key: string]: unknown;
}

export interface MetabaseDatabase {
  id: number;
  name: string;
  engine: string;
}

export interface MetabaseCard {
  id: number;
  name: string;
  display: string;
}

export interface MetabaseDashboard {
  id: number;
  name: string;
  collection_id: number | null;
}

export interface MetabaseCollection {
  id: number;
  name: string;
}

export interface DashboardCard {
  id: number;
  card_id: number | null;
  row: number;
  col: number;
  size_x: number;
  size_y: number;
}

export interface DatasetResult {
  data: {
    rows: unknown[][];
    cols: Array<{ name: string }>;
  };
}

// ── HTTP helpers ────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  sessionToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (sessionToken) {
    headers["X-Metabase-Session"] = sessionToken;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Metabase ${method} ${path} -> HTTP ${res.status}: ${text}`);
  }

  // Some endpoints return empty body
  if (!text.trim()) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

// ── Setup & Auth ────────────────────────────────────────────────────────────

export async function getSetupProperties(): Promise<SetupProperties> {
  return request<SetupProperties>("GET", "/session/properties");
}

export async function completeSetup(setupToken: string): Promise<MetabaseSession> {
  return request<MetabaseSession>("POST", "/setup", {
    token: setupToken,
    user: {
      first_name: "Flent",
      last_name: "Admin",
      email: "admin@flent.in",
      password: "FlentAdmin2026!",
    },
    prefs: {
      site_name: "Flent Analytics",
      allow_tracking: false,
    },
  });
}

export async function login(): Promise<string> {
  const session = await request<MetabaseSession>("POST", "/session", {
    username: "admin@flent.in",
    password: "FlentAdmin2026!",
  });
  return session.id;
}

// ── Database ────────────────────────────────────────────────────────────────

export async function listDatabases(token: string): Promise<MetabaseDatabase[]> {
  const result = await request<{ data: MetabaseDatabase[] }>(
    "GET",
    "/database",
    undefined,
    token
  );
  return result.data;
}

export async function addDatabase(
  token: string,
  name: string,
  host: string,
  port: number,
  dbname: string,
  user: string,
  password: string
): Promise<MetabaseDatabase> {
  return request<MetabaseDatabase>(
    "POST",
    "/database",
    {
      name,
      engine: "postgres",
      details: {
        host,
        port,
        dbname,
        user,
        password,
        ssl: false,
      },
    },
    token
  );
}

export async function syncDatabase(token: string, dbId: number): Promise<void> {
  await request<unknown>("POST", `/database/${dbId}/sync_schema`, undefined, token);
}

// ── Queries ─────────────────────────────────────────────────────────────────

export async function runNativeQuery(
  token: string,
  databaseId: number,
  sql: string
): Promise<DatasetResult> {
  return request<DatasetResult>(
    "POST",
    "/dataset",
    {
      database: databaseId,
      type: "native",
      native: { query: sql },
    },
    token
  );
}

// ── Collections ─────────────────────────────────────────────────────────────

export async function listCollections(token: string): Promise<MetabaseCollection[]> {
  return request<MetabaseCollection[]>("GET", "/collection", undefined, token);
}

export async function createCollection(
  token: string,
  name: string,
  color: string
): Promise<MetabaseCollection> {
  return request<MetabaseCollection>(
    "POST",
    "/collection",
    { name, color },
    token
  );
}

// ── Cards (saved questions) ─────────────────────────────────────────────────

export async function listCards(token: string): Promise<MetabaseCard[]> {
  return request<MetabaseCard[]>("GET", "/card", undefined, token);
}

export async function createCard(
  token: string,
  opts: {
    name: string;
    databaseId: number;
    sql: string;
    display: string;
    collectionId: number;
    visualizationSettings?: Record<string, unknown>;
  }
): Promise<MetabaseCard> {
  return request<MetabaseCard>(
    "POST",
    "/card",
    {
      name: opts.name,
      dataset_query: {
        database: opts.databaseId,
        type: "native",
        native: { query: opts.sql },
      },
      display: opts.display,
      visualization_settings: opts.visualizationSettings ?? {},
      collection_id: opts.collectionId,
    },
    token
  );
}

// ── Dashboards ──────────────────────────────────────────────────────────────

export async function listDashboards(token: string): Promise<MetabaseDashboard[]> {
  // Search for dashboards in the collection
  const result = await request<MetabaseDashboard[]>(
    "GET",
    "/dashboard",
    undefined,
    token
  );
  return result;
}

export async function createDashboard(
  token: string,
  name: string,
  collectionId: number,
  description?: string
): Promise<MetabaseDashboard> {
  return request<MetabaseDashboard>(
    "POST",
    "/dashboard",
    {
      name,
      collection_id: collectionId,
      description: description ?? null,
    },
    token
  );
}

export interface DashcardPlacement {
  id: number; // Use negative temp IDs for new cards
  card_id: number;
  row: number;
  col: number;
  size_x: number;
  size_y: number;
}

export async function setDashboardCards(
  token: string,
  dashboardId: number,
  dashcards: DashcardPlacement[]
): Promise<MetabaseDashboard> {
  return request<MetabaseDashboard>(
    "PUT",
    `/dashboard/${dashboardId}`,
    { dashcards },
    token
  );
}
