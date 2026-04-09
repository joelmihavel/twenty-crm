import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TwentyClient } from "../src/twenty-client.js";
import type { TwentyRecord } from "../src/types.js";

// ── Helpers ──────────────────────────────────────────────────────────

function makeRecord(
  hubspotId: string,
  objectType: TwentyRecord["objectType"] = "person",
  fields: Record<string, unknown> = {},
): TwentyRecord {
  return { objectType, hubspotId, fields };
}

function mockFetchSuccess(data: Record<string, unknown> = { upsertPerson: { id: "twenty-1" } }) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data }),
    text: () => Promise.resolve(JSON.stringify({ data })),
  });
}

function mockFetchGraphQLError(messages: string[]) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        errors: messages.map((m) => ({ message: m })),
      }),
    text: () =>
      Promise.resolve(JSON.stringify({ errors: messages.map((m) => ({ message: m })) })),
  });
}

function mockFetchHttpError(status: number, body: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(body),
  });
}

function createClient(batchSize = 60): TwentyClient {
  return new TwentyClient({
    apiKey: "test-api-key",
    apiUrl: "https://crm.test.example/api/graphql",
    batchSize,
  });
}

// ══════════════════════════════════════════════════════════════════════
// Tests
// ══════════════════════════════════════════════════════════════════════

describe("TwentyClient", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // ── Batch chunking ──────────────────────────────────────────────────

  describe("batch chunking", () => {
    it("sends all records in a single chunk when count <= batchSize", async () => {
      const fetchMock = mockFetchSuccess();
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      const records = Array.from({ length: 10 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      expect(result.successful).toBe(10);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(fetchMock).toHaveBeenCalledTimes(10);
    });

    it("splits records into multiple chunks when count > batchSize", async () => {
      const fetchMock = mockFetchSuccess();
      globalThis.fetch = fetchMock;

      const client = createClient(3); // small batch for testing
      const records = Array.from({ length: 7 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      // 3 chunks: [3, 3, 1] = 7 total calls
      expect(result.successful).toBe(7);
      expect(result.failed).toBe(0);
      expect(fetchMock).toHaveBeenCalledTimes(7);
    });

    it("handles exact batchSize boundary without extra chunk", async () => {
      const fetchMock = mockFetchSuccess();
      globalThis.fetch = fetchMock;

      const client = createClient(5);
      const records = Array.from({ length: 10 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      // 2 chunks of exactly 5
      expect(result.successful).toBe(10);
      expect(fetchMock).toHaveBeenCalledTimes(10);
    });
  });

  // ── Individual record failure (Promise.allSettled) ──────────────────

  describe("individual record failure handling", () => {
    it("continues processing when one record in a chunk fails", async () => {
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        // Fail the 3rd call
        if (callCount === 3) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                errors: [{ message: "Duplicate record" }],
              }),
            text: () =>
              Promise.resolve(JSON.stringify({ errors: [{ message: "Duplicate record" }] })),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ data: { upsertPerson: { id: "twenty-ok" } } }),
          text: () =>
            Promise.resolve(JSON.stringify({ data: { upsertPerson: { id: "twenty-ok" } } })),
        });
      });

      const client = createClient(60);
      const records = Array.from({ length: 5 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      expect(result.successful).toBe(4);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.hubspotId).toBe("hs-2");
      expect(result.errors[0]!.error).toContain("Duplicate record");
    });

    it("handles fetch rejection (network error) for individual records", async () => {
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error("Network timeout"));
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ data: { upsertPerson: { id: "twenty-ok" } } }),
          text: () =>
            Promise.resolve(JSON.stringify({ data: { upsertPerson: { id: "twenty-ok" } } })),
        });
      });

      const client = createClient(60);
      const records = Array.from({ length: 3 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.hubspotId).toBe("hs-1");
      expect(result.errors[0]!.error).toContain("Network timeout");
    });
  });

  // ── GraphQL error response handling ─────────────────────────────────

  describe("GraphQL error response handling", () => {
    it("reports GraphQL errors as failures", async () => {
      globalThis.fetch = mockFetchGraphQLError(["Field 'email' is required"]);

      const client = createClient(60);
      const records = [makeRecord("hs-100")];

      const result = await client.upsertBatch(records);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0]!.error).toContain("Field 'email' is required");
    });

    it("joins multiple GraphQL errors with semicolons", async () => {
      globalThis.fetch = mockFetchGraphQLError([
        "Validation error on field A",
        "Validation error on field B",
      ]);

      const client = createClient(60);
      const records = [makeRecord("hs-200")];

      const result = await client.upsertBatch(records);

      expect(result.failed).toBe(1);
      expect(result.errors[0]!.error).toBe(
        "Validation error on field A; Validation error on field B",
      );
    });
  });

  // ── HTTP error handling ─────────────────────────────────────────────

  describe("HTTP error handling", () => {
    it("reports non-200 response as failure with status code", async () => {
      globalThis.fetch = mockFetchHttpError(500, "Internal Server Error");

      const client = createClient(60);
      const records = [makeRecord("hs-300")];

      const result = await client.upsertBatch(records);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0]!.error).toBe("HTTP 500: Internal Server Error");
    });

    it("handles 401 unauthorized", async () => {
      globalThis.fetch = mockFetchHttpError(401, "Unauthorized");

      const client = createClient(60);
      const records = [makeRecord("hs-400")];

      const result = await client.upsertBatch(records);

      expect(result.failed).toBe(1);
      expect(result.errors[0]!.error).toBe("HTTP 401: Unauthorized");
    });

    it("handles 429 rate limit response", async () => {
      globalThis.fetch = mockFetchHttpError(429, "Too Many Requests");

      const client = createClient(60);
      const records = [makeRecord("hs-500")];

      const result = await client.upsertBatch(records);

      expect(result.failed).toBe(1);
      expect(result.errors[0]!.error).toBe("HTTP 429: Too Many Requests");
    });
  });

  // ── Empty batch ─────────────────────────────────────────────────────

  describe("empty batch", () => {
    it("returns zero counts and no errors for an empty array", async () => {
      const fetchMock = mockFetchSuccess();
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      const result = await client.upsertBatch([]);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  // ── Request shape validation ────────────────────────────────────────

  describe("request shape", () => {
    it("sends correct Authorization header and Content-Type", async () => {
      const fetchMock = mockFetchSuccess();
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      await client.upsertBatch([makeRecord("hs-auth")]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toBe("https://crm.test.example/api/graphql");
      expect(options.method).toBe("POST");
      expect(options.headers).toMatchObject({
        Authorization: "Bearer test-api-key",
        "Content-Type": "application/json",
      });
    });

    it("includes hubspotId in mutation variables", async () => {
      const fetchMock = mockFetchSuccess();
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      await client.upsertBatch([
        makeRecord("hs-shape", "contract", { contractId: "C-001" }),
      ]);

      const [, options] = fetchMock.mock.calls[0]!;
      const body = JSON.parse(options.body as string);
      expect(body.variables.input).toMatchObject({
        hubspotId: "hs-shape",
        contractId: "C-001",
      });
    });
  });
});
