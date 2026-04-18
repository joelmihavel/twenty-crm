import type { HubSpotObjectType, HubSpotRecord, HubSpotSearchResponse } from "./types.js";

export interface HubSpotClientOptions {
  apiKey: string;
  baseUrl: string;
  maxRetries: number;
  baseDelayMs?: number;
}

const DEFAULT_BASE_DELAY_MS = 10_000; // 10 seconds

export class HubSpotClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly baseDelayMs: number;

  constructor(options: HubSpotClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.maxRetries = options.maxRetries;
    this.baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  }

  /**
   * Search for all records of a given object type modified since a timestamp.
   * Automatically paginates and handles 429 rate limiting with exponential backoff.
   */
  async searchModifiedSince(
    objectType: HubSpotObjectType,
    sinceTimestamp: string,
    properties: string[],
  ): Promise<HubSpotRecord[]> {
    const allResults: HubSpotRecord[] = [];
    let after: string | undefined;

    do {
      const response = await this.searchPage(objectType, sinceTimestamp, properties, after);
      allResults.push(...response.results);
      after = response.paging?.next?.after;
    } while (after !== undefined);

    return allResults;
  }

  private async searchPage(
    objectType: HubSpotObjectType,
    sinceTimestamp: string,
    properties: string[],
    after?: string,
  ): Promise<HubSpotSearchResponse> {
    const url = `${this.baseUrl}/crm/v3/objects/${objectType}/search`;
    const sinceEpochMs = new Date(sinceTimestamp).getTime();

    const body = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "hs_lastmodifieddate",
              operator: "GTE",
              value: String(sinceEpochMs),
            },
          ],
        },
      ],
      properties,
      limit: 200,
      ...(after !== undefined ? { after } : {}),
    };

    return this.fetchWithRetry(url, body);
  }

  private async fetchWithRetry(
    url: string,
    body: unknown,
    attempt = 0,
  ): Promise<HubSpotSearchResponse> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return response.json() as Promise<HubSpotSearchResponse>;
    }

    if (response.status === 429 && attempt < this.maxRetries) {
      const delay = this.baseDelayMs * Math.pow(2, attempt);
      console.warn(
        `[HubSpot] Rate limited (429). Retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`,
      );
      await this.sleep(delay);
      return this.fetchWithRetry(url, body, attempt + 1);
    }

    const errorText = await response.text();
    throw new Error(
      `HubSpot API error ${response.status}: ${errorText}`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
