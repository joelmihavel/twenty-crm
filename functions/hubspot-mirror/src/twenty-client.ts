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

interface EdgesResponse {
  edges: Array<{ node: { id: string } }>;
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
   * Strategy: For each record we first search by hubspotRecordId. If found
   * we update the existing record; otherwise we create a new one. Twenty's
   * GraphQL API does NOT expose a built-in upsert mutation, so this two-step
   * find-then-mutate approach is the intended pattern.
   *
   * Concurrency: We send one GraphQL operation per record and use
   * Promise.allSettled with chunking (batchSize, default 60) for concurrency
   * control.
   */
  async upsertBatch(records: TwentyRecord[]): Promise<TwentyBatchResult> {
    const result: TwentyBatchResult = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Process in chunks of batchSize.
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

  /**
   * Find an existing record by hubspotRecordId, then create or update.
   */
  private async upsertSingle(record: TwentyRecord): Promise<TwentyUpsertResult> {
    const objectName = this.getObjectName(record.objectType);
    const pluralName = this.getPluralName(record.objectType);

    // Step 1: Search for existing record by hubspotRecordId
    const existingId = await this.findByHubspotRecordId(
      pluralName,
      record.hubspotId,
    );

    // Step 2: Create or update
    const data: Record<string, unknown> = {
      hubspotRecordId: record.hubspotId,
      ...record.fields,
    };

    const mutation = existingId !== null
      ? this.buildUpdateMutation(objectName, existingId, data)
      : this.buildCreateMutation(objectName, data);

    const response = await this.executeGraphQL(mutation.query, mutation.variables);

    if (!response.success) {
      return {
        success: false,
        hubspotId: record.hubspotId,
        error: response.error,
      };
    }

    return {
      success: true,
      hubspotId: record.hubspotId,
    };
  }

  /**
   * Search for a record by hubspotRecordId filter. Returns the Twenty ID
   * if found, null otherwise.
   */
  private async findByHubspotRecordId(
    pluralName: string,
    hubspotRecordId: string,
  ): Promise<string | null> {
    const query = `
      query Find${capitalize(pluralName)}($filter: ${capitalize(singularFromPlural(pluralName))}FilterInput) {
        ${pluralName}(filter: $filter, first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const variables = {
      filter: {
        hubspotRecordId: { eq: hubspotRecordId },
      },
    };

    const response = await this.executeGraphQL(query, variables);

    if (!response.success || !response.data) {
      // If the search fails, treat as not found and try to create
      return null;
    }

    const collection = response.data[pluralName] as EdgesResponse | undefined;
    const edges = collection?.edges;
    if (edges && edges.length > 0 && edges[0]) {
      return edges[0].node.id;
    }

    return null;
  }

  private buildCreateMutation(
    objectName: string,
    data: Record<string, unknown>,
  ): { query: string; variables: Record<string, unknown> } {
    const capitalized = capitalize(objectName);
    return {
      query: `
        mutation Create${capitalized}($data: ${capitalized}CreateInput!) {
          create${capitalized}(data: $data) {
            id
          }
        }
      `,
      variables: { data },
    };
  }

  private buildUpdateMutation(
    objectName: string,
    id: string,
    data: Record<string, unknown>,
  ): { query: string; variables: Record<string, unknown> } {
    const capitalized = capitalize(objectName);
    return {
      query: `
        mutation Update${capitalized}($id: ID!, $data: ${capitalized}UpdateInput!) {
          update${capitalized}(id: $id, data: $data) {
            id
          }
        }
      `,
      variables: { id, data },
    };
  }

  /**
   * Execute a GraphQL query/mutation and return the result.
   */
  private async executeGraphQL(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${text}` };
    }

    const json = (await response.json()) as GraphQLResponse;

    if (json.errors && json.errors.length > 0) {
      return {
        success: false,
        error: json.errors.map((e) => e.message).join("; "),
      };
    }

    return { success: true, data: json.data };
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

  private getPluralName(objectType: TwentyObjectType): string {
    const pluralMap: Record<TwentyObjectType, string> = {
      person: "people",
      tenant: "tenants",
      landlord: "landlords",
      opportunity: "opportunities",
      contract: "contracts",
      property: "properties",
      room: "rooms",
      ticket: "tickets",
    };
    return pluralMap[objectType];
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Derive the singular form from a plural name for GraphQL type names.
 * E.g. "tenants" -> "Tenant", "people" -> "Person", "properties" -> "Property"
 */
function singularFromPlural(plural: string): string {
  const irregulars: Record<string, string> = {
    people: "person",
    opportunities: "opportunity",
    properties: "property",
  };

  if (irregulars[plural]) {
    return irregulars[plural]!;
  }

  // Regular: remove trailing 's'
  if (plural.endsWith("s")) {
    return plural.slice(0, -1);
  }

  return plural;
}
