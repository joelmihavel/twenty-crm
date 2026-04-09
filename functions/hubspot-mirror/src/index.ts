import { http } from "@google-cloud/functions-framework";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { HubSpotClient } from "./hubspot-client.js";
import { TwentyClient } from "./twenty-client.js";
import { CheckpointManager } from "./checkpoint.js";
import { OBJECT_MAPPERS } from "./field-mapping.js";
import type {
  HubSpotObjectType,
  TwentyRecord,
  TwentyBatchResult,
  SyncConfig,
  MappingError,
} from "./types.js";
import {
  DEFAULT_CONFIG,
  HUBSPOT_OBJECT_IDS,
  CONTACT_PEOPLE_FIELDS,
  TENANT_FIELDS,
  LANDLORD_FIELDS,
  DEAL_FIELDS,
  CONTRACT_FIELDS,
  PROPERTY_FIELDS,
  ROOM_FIELDS,
  TICKET_FIELDS,
} from "./types.js";

// ── Secret Manager ───────────────────────────────────────────────────

const secretClient = new SecretManagerServiceClient();

async function getSecret(secretName: string): Promise<string> {
  const projectId = process.env["GCP_PROJECT"] ?? process.env["GCLOUD_PROJECT"] ?? "flent-infra";
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await secretClient.accessSecretVersion({ name });
  const payload = version.payload?.data;
  if (!payload) {
    throw new Error(`Secret ${secretName} has no payload`);
  }
  return typeof payload === "string" ? payload : Buffer.from(payload).toString("utf-8");
}

// ── Properties per object type ───────────────────────────────────────

const PROPERTIES_BY_OBJECT: Record<HubSpotObjectType, readonly string[]> = {
  contacts: [
    ...CONTACT_PEOPLE_FIELDS,
    ...TENANT_FIELDS,
    ...LANDLORD_FIELDS,
  ],
  deals: DEAL_FIELDS,
  tickets: TICKET_FIELDS,
  "2-35314522": CONTRACT_FIELDS,
  "2-35314851": PROPERTY_FIELDS,
  "2-35432178": ROOM_FIELDS,
};

// ── Sync Logic ───────────────────────────────────────────────────────

async function runSync(config: SyncConfig): Promise<{
  totalFetched: number;
  totalMapped: number;
  totalUpserted: number;
  totalFailed: number;
  mappingErrors: MappingError[];
  upsertErrors: TwentyBatchResult["errors"];
}> {
  const hubspot = new HubSpotClient({
    apiKey: config.hubspotApiKey,
    baseUrl: config.hubspotBaseUrl,
    maxRetries: config.maxRetriesOn429,
  });

  const twenty = new TwentyClient({
    apiKey: config.twentyApiKey,
    apiUrl: config.twentyApiUrl,
    batchSize: config.batchSize,
  });

  const checkpointMgr = new CheckpointManager(config.gcsBucket, config.gcsCheckpointPath);

  // 1. Read checkpoint
  const checkpoint = await checkpointMgr.read();
  console.info(`[Sync] Starting sync from checkpoint: ${checkpoint.lastSyncTimestamp}`);

  let totalFetched = 0;
  let totalMapped = 0;
  const allMappingErrors: MappingError[] = [];
  const allTwentyRecords: TwentyRecord[] = [];

  // 2. Fetch and map each object type
  const objectTypes = Object.keys(HUBSPOT_OBJECT_IDS) as Array<keyof typeof HUBSPOT_OBJECT_IDS>;

  for (const objectKey of objectTypes) {
    const objectType = HUBSPOT_OBJECT_IDS[objectKey];
    const properties = PROPERTIES_BY_OBJECT[objectType];
    const mapper = OBJECT_MAPPERS[objectType];

    if (!mapper || !properties) {
      console.warn(`[Sync] No mapper/properties for object type ${objectType}, skipping`);
      continue;
    }

    try {
      console.info(`[Sync] Fetching ${objectKey} (${objectType}) modified since ${checkpoint.lastSyncTimestamp}`);

      const records = await hubspot.searchModifiedSince(
        objectType,
        checkpoint.lastSyncTimestamp,
        [...properties],
      );

      totalFetched += records.length;
      console.info(`[Sync] Fetched ${records.length} ${objectKey} records`);

      for (const record of records) {
        try {
          const mapped = mapper(record);
          allTwentyRecords.push(...mapped.records);
          allMappingErrors.push(...mapped.errors);
          totalMapped += mapped.records.length;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(
            `[Sync] Mapping error for ${objectKey} id=${record.id}: ${message}`,
          );
          allMappingErrors.push({
            hubspotId: record.id,
            objectType,
            message,
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Sync] Fatal error fetching ${objectKey}: ${message}`);
      throw error; // Re-throw to prevent checkpoint update
    }
  }

  // 3. Upsert all mapped records into Twenty
  console.info(`[Sync] Upserting ${allTwentyRecords.length} records into Twenty`);
  const upsertResult = await twenty.upsertBatch(allTwentyRecords);

  // 4. Update checkpoint only on success
  const newCheckpoint = CheckpointManager.createNow();
  await checkpointMgr.write(newCheckpoint);

  return {
    totalFetched,
    totalMapped,
    totalUpserted: upsertResult.successful,
    totalFailed: upsertResult.failed,
    mappingErrors: allMappingErrors,
    upsertErrors: upsertResult.errors,
  };
}

// ── HTTP Handler ─────────────────────────────────────────────────────

http("hubspotMirror", async (_req, res) => {
  const startTime = Date.now();
  console.info("[HubSpotMirror] Invoked");

  try {
    // Load secrets
    const hubspotApiKey = process.env["HUBSPOT_API_KEY"] ?? await getSecret("hubspot-api-key");
    const twentyApiKey = process.env["TWENTY_API_KEY"] ?? await getSecret("twenty-api-key");

    const config: SyncConfig = {
      hubspotApiKey,
      twentyApiKey,
      hubspotBaseUrl: process.env["HUBSPOT_BASE_URL"] ?? DEFAULT_CONFIG.hubspotBaseUrl,
      twentyApiUrl: process.env["TWENTY_API_URL"] ?? DEFAULT_CONFIG.twentyApiUrl,
      gcsBucket: process.env["GCS_BUCKET"] ?? DEFAULT_CONFIG.gcsBucket,
      gcsCheckpointPath: process.env["GCS_CHECKPOINT_PATH"] ?? DEFAULT_CONFIG.gcsCheckpointPath,
      batchSize: Number(process.env["BATCH_SIZE"]) || DEFAULT_CONFIG.batchSize,
      maxRetriesOn429: Number(process.env["MAX_RETRIES"]) || DEFAULT_CONFIG.maxRetriesOn429,
    };

    const result = await runSync(config);

    const durationMs = Date.now() - startTime;
    const summary = {
      status: "ok",
      durationMs,
      totalFetched: result.totalFetched,
      totalMapped: result.totalMapped,
      totalUpserted: result.totalUpserted,
      totalFailed: result.totalFailed,
      mappingErrorCount: result.mappingErrors.length,
      upsertErrorCount: result.upsertErrors.length,
    };

    console.info("[HubSpotMirror] Completed", JSON.stringify(summary));

    if (result.mappingErrors.length > 0) {
      console.warn(
        "[HubSpotMirror] Mapping errors:",
        JSON.stringify(result.mappingErrors),
      );
    }
    if (result.upsertErrors.length > 0) {
      console.warn(
        "[HubSpotMirror] Upsert errors:",
        JSON.stringify(result.upsertErrors),
      );
    }

    res.status(200).json(summary);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[HubSpotMirror] Fatal error after ${durationMs}ms: ${message}`);

    res.status(500).json({
      status: "error",
      durationMs,
      error: message,
    });
  }
});
