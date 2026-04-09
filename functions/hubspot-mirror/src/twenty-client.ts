import type {
  TwentyRecord,
  TwentyBatchResult,
  TwentyUpsertResult,
  TwentyObjectType,
} from "./types.js";

export interface TwentyClientOptions {
  apiKey: string;
  apiUrl: string;
  batchSize: number;
}

interface GraphQLResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

export class TwentyClient {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly batchSize: number;

  constructor(options: TwentyClientOptions) {
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl;
    this.batchSize = options.batchSize;
  }

  /**
   * Upsert records into Twenty CRM in batches.
   * Individual failures are logged and skipped; the batch continues.
   *
   * NOTE ON BATCH STRATEGY: Twenty's GraphQL API exposes individual mutations
   * per object type (e.g. upsertPerson, upsertContract) and does NOT provide
   * a bulk/createMany mutation. Therefore we send one GraphQL mutation per
   * record and use Promise.allSettled with chunking (batchSize, default 60)
   * for concurrency control. This is the intended integration pattern for
   * Twenty -- it is NOT a workaround for a missing batch endpoint.
   */
  async upsertBatch(records: TwentyRecord[]): Promise<TwentyBatchResult> {
    const result: TwentyBatchResult = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Process in chunks of batchSize.
    // Each chunk fires up to batchSize concurrent individual GraphQL mutations
    // via Promise.allSettled. See method-level JSDoc for rationale.
    for (let i = 0; i < records.length; i += this.batchSize) {
      const chunk = records.slice(i, i + this.batchSize);
      const chunkResults = await Promise.allSettled(
        chunk.map((record) => this.upsertSingle(record)),
      );

      for (let j = 0; j < chunkResults.length; j++) {
        const settledResult = chunkResults[j]!;
        const record = chunk[j]!;

        if (settledResult.status === "fulfilled" && settledResult.value.success) {
          result.successful++;
        } else {
          result.failed++;
          const errorMessage =
            settledResult.status === "rejected"
              ? String(settledResult.reason)
              : settledResult.value.error ?? "Unknown error";
          result.errors.push({
            hubspotId: record.hubspotId,
            objectType: record.objectType,
            error: errorMessage,
          });
          console.error(
            `[Twenty] Failed to upsert ${record.objectType} hubspotId=${record.hubspotId}: ${errorMessage}`,
          );
        }
      }
    }

    return result;
  }

  private async upsertSingle(record: TwentyRecord): Promise<TwentyUpsertResult> {
    const mutation = this.buildUpsertMutation(record);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation.query, variables: mutation.variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        success: false,
        hubspotId: record.hubspotId,
        error: `HTTP ${response.status}: ${text}`,
      };
    }

    const json = (await response.json()) as GraphQLResponse;

    if (json.errors && json.errors.length > 0) {
      return {
        success: false,
        hubspotId: record.hubspotId,
        error: json.errors.map((e) => e.message).join("; "),
      };
    }

    return {
      success: true,
      hubspotId: record.hubspotId,
    };
  }

  private buildUpsertMutation(record: TwentyRecord): {
    query: string;
    variables: Record<string, unknown>;
  } {
    const objectName = this.getObjectName(record.objectType);
    const mutationName = `upsert${capitalize(objectName)}`;

    return {
      query: `
        mutation ${mutationName}($input: ${capitalize(objectName)}CreateInput!) {
          ${mutationName}(
            upsertOn: { hubspotId: "${record.hubspotId}" }
            input: $input
          ) {
            id
          }
        }
      `,
      variables: {
        input: {
          hubspotId: record.hubspotId,
          ...record.fields,
        },
      },
    };
  }

  private getObjectName(objectType: TwentyObjectType): string {
    const nameMap: Record<TwentyObjectType, string> = {
      person: "person",
      tenant: "tenant",
      landlord: "landlord",
      opportunity: "opportunity",
      contract: "contract",
      property: "property",
      room: "room",
      ticket: "ticket",
    };
    return nameMap[objectType];
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
