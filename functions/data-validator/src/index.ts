/**
 * Data Validator Cloud Function (2nd gen).
 *
 * Triggered by Pub/Sub `crm-events` topic. Validates Indian-format fields
 * on Twenty CRM record writes and flags invalid data by:
 *   1. Updating the record with `_validation_errors` (JSON string)
 *   2. Creating a Task assigned to the record owner with error details
 *
 * Idempotent: uses the record ID + event type as the Task external ID
 * to prevent duplicate task creation.
 */

import { cloudEvent, type CloudEvent } from "@google-cloud/functions-framework";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { validateRecord } from "./validators";
import type { CrmEvent, CrmObjectName, ValidationResult } from "./types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TWENTY_API_URL = process.env["TWENTY_API_URL"] ?? "https://api.twenty.com/api";
const SECRET_NAME =
  process.env["TWENTY_API_KEY_SECRET"] ??
  "projects/flent-infra/secrets/twenty-api-key/versions/latest";

// ---------------------------------------------------------------------------
// Secret Manager — lazily cached API key
// ---------------------------------------------------------------------------

let cachedApiKey: string | null = null;
const secretClient = new SecretManagerServiceClient();

async function getApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;

  // Allow override via env for local dev / testing
  const envKey = process.env["TWENTY_API_KEY"];
  if (envKey) {
    cachedApiKey = envKey;
    return envKey;
  }

  const [version] = await secretClient.accessSecretVersion({ name: SECRET_NAME });
  const payload = version.payload?.data;
  if (!payload) {
    throw new Error("Failed to retrieve Twenty API key from Secret Manager");
  }
  cachedApiKey = typeof payload === "string" ? payload : Buffer.from(payload).toString("utf8");
  return cachedApiKey;
}

// ---------------------------------------------------------------------------
// Twenty GraphQL helpers
// ---------------------------------------------------------------------------

async function twentyGraphQL(query: string, variables: Record<string, unknown>): Promise<unknown> {
  const apiKey = await getApiKey();
  const response = await fetch(`${TWENTY_API_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twenty API error ${response.status}: ${text}`);
  }

  const json = (await response.json()) as { data?: unknown; errors?: Array<{ message: string }> };
  if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
    throw new Error(`Twenty GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  return json.data;
}

/**
 * Update the record's `_validation_errors` field with a JSON-encoded
 * array of validation errors (or null if valid).
 */
async function updateValidationErrors(
  objectType: CrmObjectName,
  recordId: string,
  result: ValidationResult,
): Promise<void> {
  const errorsValue = result.valid ? null : JSON.stringify(result.errors);

  // Twenty uses singular pascal-case for mutation names, e.g. updatePerson, updateLandlord
  const objectName = objectType.charAt(0).toUpperCase() + objectType.slice(1);
  const mutation = `
    mutation UpdateValidationErrors($id: ID!, $data: ${objectName}UpdateInput!) {
      update${objectName}(id: $id, data: $data) {
        id
      }
    }
  `;

  await twentyGraphQL(mutation, {
    id: recordId,
    data: { _validation_errors: errorsValue },
  });
}

/**
 * Create a Task in Twenty assigned to the record owner with validation
 * error details. Uses an idempotency key derived from record ID + event type
 * to prevent duplicates.
 */
async function createValidationTask(
  objectType: CrmObjectName,
  recordId: string,
  eventType: string,
  result: ValidationResult,
): Promise<void> {
  const errorSummary = result.errors
    .map((e) => `- ${e.field}: ${e.message} (value: "${String(e.value)}")`)
    .join("\n");

  const title = `Validation errors on ${objectType} ${recordId}`;
  const body = `The following fields failed validation:\n\n${errorSummary}`;

  // Idempotency: use a deterministic external ID so re-processing the same
  // event does not create duplicate tasks.
  const externalId = `validation-${recordId}-${eventType}`;

  const mutation = `
    mutation CreateValidationTask($data: TaskCreateInput!) {
      createTask(data: $data) {
        id
      }
    }
  `;

  await twentyGraphQL(mutation, {
    data: {
      title,
      body,
      status: "TODO",
      externalId,
    },
  });
}

// ---------------------------------------------------------------------------
// Pub/Sub message decoding
// ---------------------------------------------------------------------------

interface PubSubMessageData {
  message?: {
    data?: string;
  };
}

function decodePubSubMessage(event: CloudEvent<PubSubMessageData>): CrmEvent {
  const base64Data = event.data?.message?.data;
  if (!base64Data) {
    throw new Error("No Pub/Sub message data found in CloudEvent");
  }
  const decoded = Buffer.from(base64Data, "base64").toString("utf8");
  return JSON.parse(decoded) as CrmEvent;
}

// ---------------------------------------------------------------------------
// Cloud Function entry point
// ---------------------------------------------------------------------------

cloudEvent("dataValidator", async (event: CloudEvent<PubSubMessageData>) => {
  let crmEvent: CrmEvent;
  try {
    crmEvent = decodePubSubMessage(event);
  } catch (err) {
    console.error("Failed to decode Pub/Sub message:", err);
    return; // Acknowledge — malformed messages should not be retried
  }

  const { objectMetadata, record, eventType } = crmEvent;
  const objectType = objectMetadata.nameSingular;

  console.log(`Processing ${eventType} for ${objectType} record ${record.id}`);

  // Validate
  const result = validateRecord(objectType, record);

  // Log summary
  if (result.valid) {
    console.log(`Validation PASSED for ${objectType} ${record.id} — all fields valid`);
  } else {
    console.warn(
      `Validation FAILED for ${objectType} ${record.id} — ` +
        `${result.errors.length} error(s): ${result.errors.map((e) => e.field).join(", ")}`,
    );
  }

  // If any errors, update the record and create a Task
  if (!result.valid) {
    try {
      await updateValidationErrors(objectType, record.id, result);
      console.log(`Updated _validation_errors on ${objectType} ${record.id}`);
    } catch (err) {
      console.error(`Failed to update validation errors on ${objectType} ${record.id}:`, err);
    }

    try {
      await createValidationTask(objectType, record.id, eventType, result);
      console.log(`Created validation Task for ${objectType} ${record.id}`);
    } catch (err) {
      console.error(`Failed to create validation Task for ${objectType} ${record.id}:`, err);
    }
  } else {
    // Clear any previous validation errors
    try {
      await updateValidationErrors(objectType, record.id, result);
    } catch (err) {
      console.error(`Failed to clear validation errors on ${objectType} ${record.id}:`, err);
    }
  }
});
