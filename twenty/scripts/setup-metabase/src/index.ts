/**
 * Flent Metabase Dashboard Setup
 *
 * Automates:
 *  1. Metabase initial setup (if needed)
 *  2. Twenty PostgreSQL data source connection
 *  3. Workspace schema discovery
 *  4. Creation of 5 dashboards with 19 SQL queries
 *
 * Idempotent: checks for existing resources before creating.
 *
 * Environment variables:
 *   METABASE_URL     - Metabase base URL (default: http://localhost:3001)
 *   DB_HOST          - PostgreSQL host (default: localhost)
 *   DB_PORT          - PostgreSQL port (default: 5432)
 *   DB_NAME          - Database name (default: twenty)
 *   DB_USER          - Database user (default: twenty)
 *   DB_PASSWORD      - Database password (required)
 *
 * Usage:
 *   DB_PASSWORD=<pass> npm run setup
 */

import {
  getSetupProperties,
  completeSetup,
  login,
  listDatabases,
  addDatabase,
  syncDatabase,
  runNativeQuery,
  listCollections,
  createCollection,
  listCards,
  createCard,
  listDashboards,
  createDashboard,
  setDashboardCards,
  type DashcardPlacement,
} from "./metabase-client.js";

import { DASHBOARDS } from "./dashboards.js";

// ── Config ──────────────────────────────────────────────────────────────────

const DB_HOST = process.env.DB_HOST ?? "localhost";
const DB_PORT = parseInt(process.env.DB_PORT ?? "5432", 10);
const DB_NAME = process.env.DB_NAME ?? "twenty";
const DB_USER = process.env.DB_USER ?? "twenty";
const DB_PASSWORD = process.env.DB_PASSWORD ?? "";

const COLLECTION_NAME = "Flent Dashboards";
const DATABASE_NAME = "Twenty CRM (Read Replica)";

// ── Helpers ─────────────────────────────────────────────────────────────────

function banner(msg: string): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${"=".repeat(60)}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Result tracking ─────────────────────────────────────────────────────────

interface SetupResult {
  metabaseInitialized: boolean;
  dataSourceConnected: boolean;
  databaseId: number;
  workspaceSchema: string;
  dashboardsCreated: number;
  cardsCreated: number;
  cardsSkipped: number;
  errors: Array<{ context: string; message: string }>;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<SetupResult> {
  const result: SetupResult = {
    metabaseInitialized: false,
    dataSourceConnected: false,
    databaseId: 0,
    workspaceSchema: "",
    dashboardsCreated: 0,
    cardsCreated: 0,
    cardsSkipped: 0,
    errors: [],
  };

  console.log("Flent Metabase Dashboard Setup");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Metabase: ${process.env.METABASE_URL ?? "http://localhost:3001"}`);
  console.log(`DB: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}\n`);

  // ── Step 1: Metabase initialization ─────────────────────────────────────

  banner("Step 1: Metabase Initialization");

  let sessionToken: string;

  try {
    const props = await getSetupProperties();
    const setupToken = props["setup-token"];

    if (setupToken) {
      console.log("  Setup token found -- running first-time setup...");
      try {
        const session = await completeSetup(setupToken);
        sessionToken = session.id;
        console.log("  Metabase setup completed. Admin user created.");
      } catch (setupErr) {
        // Setup may fail if user already exists (stale token).
        // Fall back to regular login.
        const setupMsg = setupErr instanceof Error ? setupErr.message : String(setupErr);
        console.log(`  Setup returned error (likely user exists): ${setupMsg}`);
        console.log("  Falling back to login...");
        sessionToken = await login();
        console.log("  Logged in successfully.");
      }
      result.metabaseInitialized = true;
    } else {
      console.log("  Metabase already initialized. Logging in...");
      sessionToken = await login();
      result.metabaseInitialized = true;
      console.log("  Logged in successfully.");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  FATAL: Cannot connect to Metabase: ${msg}`);
    result.errors.push({ context: "metabase-init", message: msg });
    return result;
  }

  // ── Step 2: Add PostgreSQL data source ──────────────────────────────────

  banner("Step 2: PostgreSQL Data Source");

  if (!DB_PASSWORD) {
    console.error("  FATAL: DB_PASSWORD environment variable is required.");
    result.errors.push({
      context: "data-source",
      message: "DB_PASSWORD not set",
    });
    return result;
  }

  try {
    const databases = await listDatabases(sessionToken);
    const existing = databases.find((d) => d.name === DATABASE_NAME);

    if (existing) {
      console.log(
        `  Database "${DATABASE_NAME}" already exists (id=${existing.id}). Skipping.`
      );
      result.databaseId = existing.id;
      result.dataSourceConnected = true;
    } else {
      console.log(`  Adding database "${DATABASE_NAME}"...`);
      const db = await addDatabase(
        sessionToken,
        DATABASE_NAME,
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_USER,
        DB_PASSWORD
      );
      result.databaseId = db.id;
      result.dataSourceConnected = true;
      console.log(`  Database added (id=${db.id}). Triggering sync...`);

      try {
        await syncDatabase(sessionToken, db.id);
        console.log("  Sync triggered.");
      } catch {
        console.warn("  Sync trigger failed (non-fatal). Metabase will auto-sync.");
      }
      console.log("  Waiting 8s for schema discovery...");
      await sleep(8000);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  FATAL: Cannot add data source: ${msg}`);
    result.errors.push({ context: "data-source", message: msg });
    return result;
  }

  // ── Step 3: Discover workspace schema ───────────────────────────────────

  banner("Step 3: Workspace Schema Discovery");

  try {
    const dsResult = await runNativeQuery(
      sessionToken,
      result.databaseId,
      `SELECT schema_name
       FROM information_schema.schemata
       WHERE schema_name LIKE 'workspace_%'
       ORDER BY schema_name
       LIMIT 5`
    );

    const schemas = dsResult.data.rows.map((r) => String(r[0]));

    if (schemas.length === 0) {
      console.error("  FATAL: No workspace schema found.");
      result.errors.push({
        context: "schema-discovery",
        message: "No workspace_* schema found in database",
      });
      return result;
    }

    // Use the first workspace schema
    result.workspaceSchema = schemas[0];
    console.log(`  Found ${schemas.length} workspace schema(s).`);
    console.log(`  Using: ${result.workspaceSchema}`);

    // Verify the schema has the expected tables
    const tableCheck = await runNativeQuery(
      sessionToken,
      result.databaseId,
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = '${result.workspaceSchema}'
         AND table_name IN ('_room', '_property', '_contract', '_ticket', 'opportunity', '_tenant')
       ORDER BY table_name`
    );

    const tables = tableCheck.data.rows.map((r) => String(r[0]));
    console.log(`  Verified tables: ${tables.join(", ")}`);

    if (tables.length < 6) {
      console.warn(
        `  WARNING: Expected 6 tables but found ${tables.length}. Some queries may fail.`
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  FATAL: Schema discovery failed: ${msg}`);
    result.errors.push({ context: "schema-discovery", message: msg });
    return result;
  }

  // ── Step 4: Create collection ───────────────────────────────────────────

  banner("Step 4: Collection Setup");

  let collectionId: number;

  try {
    const collections = await listCollections(sessionToken);
    const existing = collections.find((c) => c.name === COLLECTION_NAME);

    if (existing) {
      console.log(
        `  Collection "${COLLECTION_NAME}" exists (id=${existing.id}). Reusing.`
      );
      collectionId = existing.id;
    } else {
      console.log(`  Creating collection "${COLLECTION_NAME}"...`);
      const col = await createCollection(
        sessionToken,
        COLLECTION_NAME,
        "#509EE3"
      );
      collectionId = col.id;
      console.log(`  Collection created (id=${collectionId}).`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  FATAL: Cannot create collection: ${msg}`);
    result.errors.push({ context: "collection", message: msg });
    return result;
  }

  // ── Step 5: Create dashboards and cards ─────────────────────────────────

  banner("Step 5: Creating 5 Dashboards");

  // Build lookup of existing cards for idempotency
  let existingCards: Array<{ id: number; name: string }> = [];
  try {
    existingCards = await listCards(sessionToken);
  } catch {
    console.warn("  Could not fetch existing cards. Will attempt creation.");
  }
  const cardsByName = new Map(existingCards.map((c) => [c.name, c.id]));

  // Build lookup of existing dashboards
  let existingDashboards: Array<{ id: number; name: string; collection_id: number | null }> = [];
  try {
    existingDashboards = await listDashboards(sessionToken);
  } catch {
    console.warn("  Could not fetch existing dashboards. Will attempt creation.");
  }
  const dashboardsByName = new Map(
    existingDashboards
      .filter((d) => d.collection_id === collectionId)
      .map((d) => [d.name, d.id])
  );

  for (const dashDef of DASHBOARDS) {
    console.log(`\n  --- ${dashDef.name} ---`);

    // Create or reuse dashboard
    let dashId: number;
    if (dashboardsByName.has(dashDef.name)) {
      dashId = dashboardsByName.get(dashDef.name)!;
      console.log(`  [skip] Dashboard already exists (id=${dashId}).`);
    } else {
      try {
        const dash = await createDashboard(
          sessionToken,
          dashDef.name,
          collectionId,
          dashDef.description
        );
        dashId = dash.id;
        result.dashboardsCreated++;
        console.log(`  [created] Dashboard (id=${dashId}).`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  [error] Dashboard "${dashDef.name}": ${msg}`);
        result.errors.push({
          context: `dashboard:${dashDef.name}`,
          message: msg,
        });
        continue;
      }
    }

    // Create cards, then place them all on the dashboard at once
    const dashcards: DashcardPlacement[] = [];
    let currentRow = 0;

    for (let i = 0; i < dashDef.queries.length; i++) {
      const queryDef = dashDef.queries[i];
      const sql = queryDef.sql.replace(/\{\{SCHEMA\}\}/g, result.workspaceSchema);

      // Check if card already exists
      let cardId: number;
      if (cardsByName.has(queryDef.name)) {
        cardId = cardsByName.get(queryDef.name)!;
        console.log(
          `    [skip] Card "${queryDef.name}" exists (id=${cardId}).`
        );
        result.cardsSkipped++;
      } else {
        try {
          const card = await createCard(sessionToken, {
            name: queryDef.name,
            databaseId: result.databaseId,
            sql,
            display: queryDef.display,
            collectionId,
            visualizationSettings: queryDef.visualizationSettings,
          });
          cardId = card.id;
          console.log(
            `    [created] Card "${queryDef.name}" (id=${card.id}, display=${queryDef.display}).`
          );
          result.cardsCreated++;
          cardsByName.set(queryDef.name, card.id);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`    [error] Card "${queryDef.name}": ${msg}`);
          result.errors.push({
            context: `card:${queryDef.name}`,
            message: msg,
          });
          continue;
        }
      }

      // Compute grid layout
      // Scalar cards: 6 wide, 3 tall (up to 3 per row)
      // Table cards: 18 wide, 8 tall (full width)
      // Chart cards: 9 wide, 6 tall (2 per row)
      let sizeX: number;
      let sizeY: number;
      let col: number;

      if (queryDef.display === "scalar") {
        sizeX = 6;
        sizeY = 3;
        // Place scalars side by side (up to 3 per row)
        const scalarIndex = dashcards.filter((dc) => dc.size_x === 6).length;
        col = (scalarIndex % 3) * 6;
        if (scalarIndex > 0 && scalarIndex % 3 === 0) {
          currentRow += 3;
        }
      } else if (queryDef.display === "table") {
        sizeX = 18;
        sizeY = 8;
        col = 0;
      } else {
        sizeX = 9;
        sizeY = 6;
        // Place charts 2 per row
        const chartIndex = dashcards.filter(
          (dc) => dc.size_x === 9
        ).length;
        col = (chartIndex % 2) * 9;
        if (chartIndex > 0 && chartIndex % 2 === 0) {
          currentRow += 6;
        }
      }

      dashcards.push({
        id: -(i + 1), // negative temp IDs for new placements
        card_id: cardId,
        row: currentRow,
        col,
        size_x: sizeX,
        size_y: sizeY,
      });

      // Advance row for full-width cards
      if (queryDef.display === "table") {
        currentRow += sizeY;
      }
    }

    // Place all cards on the dashboard
    if (dashcards.length > 0) {
      try {
        await setDashboardCards(sessionToken, dashId, dashcards);
        console.log(`  [layout] Placed ${dashcards.length} cards on dashboard.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  [error] Setting dashboard layout: ${msg}`);
        result.errors.push({
          context: `layout:${dashDef.name}`,
          message: msg,
        });
      }
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────

  banner("Setup Complete");
  console.log(`  Metabase initialized: ${result.metabaseInitialized ? "yes" : "no"}`);
  console.log(`  Data source connected: ${result.dataSourceConnected ? "yes" : "no"}`);
  console.log(`  Database ID: ${result.databaseId}`);
  console.log(`  Workspace schema: ${result.workspaceSchema}`);
  console.log(`  Dashboards created: ${result.dashboardsCreated}`);
  console.log(`  Cards created: ${result.cardsCreated}`);
  console.log(`  Cards skipped: ${result.cardsSkipped}`);
  console.log(`  Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log("\n  Error details:");
    for (const e of result.errors) {
      console.log(`    - [${e.context}] ${e.message}`);
    }
  }

  const totalCards = DASHBOARDS.reduce((sum, d) => sum + d.queries.length, 0);
  console.log(
    `\n  Total: ${result.dashboardsCreated}/5 dashboards, ` +
      `${result.cardsCreated}/${totalCards} cards`
  );

  if (result.errors.length > 0) {
    process.exitCode = 1;
  }

  return result;
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
