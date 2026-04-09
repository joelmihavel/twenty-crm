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

/**
 * Build a fetch mock that handles the search-then-mutate pattern.
 * For each upsert, the client sends two requests:
 *   1. A search query (findByHubspotRecordId)
 *   2. A create or update mutation
 *
 * @param existingId - If provided, the search returns this ID (triggers update); otherwise returns empty edges (triggers create)
 */
function mockFetchForUpsert(existingId: string | null = null) {
  let callIndex = 0;
  return vi.fn().mockImplementation(() => {
    callIndex++;
    const isSearchCall = callIndex % 2 === 1; // odd calls = search, even calls = mutate

    if (isSearchCall) {
      // Search response: return existing record or empty
      const edges = existingId
        ? [{ node: { id: existingId } }]
        : [];
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: { people: { edges }, tenants: { edges }, landlords: { edges }, contracts: { edges }, properties: { edges }, rooms: { edges }, tickets: { edges }, opportunities: { edges } },
        }),
        text: () => Promise.resolve("{}"),
      });
    }

    // Mutation response (create or update)
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { createPerson: { id: "twenty-new" } } }),
      text: () => Promise.resolve("{}"),
    });
  });
}

/**
 * Build a fetch mock that returns empty search results + successful create for all calls.
 * Simpler version for batch/chunking tests.
 */
function mockFetchCreateAll() {
  return vi.fn().mockImplementation((_url: string, options: { body: string }) => {
    const body = JSON.parse(options.body);
    const queryStr = body.query as string;
    const isSearch = queryStr.includes("query Find");

    if (isSearch) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            people: { edges: [] },
            tenants: { edges: [] },
            landlords: { edges: [] },
            contracts: { edges: [] },
            properties: { edges: [] },
            rooms: { edges: [] },
            tickets: { edges: [] },
            opportunities: { edges: [] },
          },
        }),
        text: () => Promise.resolve("{}"),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { createPerson: { id: "twenty-new" } } }),
      text: () => Promise.resolve("{}"),
    });
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
      const fetchMock = mockFetchCreateAll();
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      const records = Array.from({ length: 10 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      expect(result.successful).toBe(10);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      // 2 calls per record: 1 search + 1 create
      expect(fetchMock).toHaveBeenCalledTimes(20);
    });

    it("splits records into multiple chunks when count > batchSize", async () => {
      const fetchMock = mockFetchCreateAll();
      globalThis.fetch = fetchMock;

      const client = createClient(3); // small batch for testing
      const records = Array.from({ length: 7 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      // 3 chunks: [3, 3, 1] = 7 total records, 14 fetch calls
      expect(result.successful).toBe(7);
      expect(result.failed).toBe(0);
      expect(fetchMock).toHaveBeenCalledTimes(14);
    });

    it("handles exact batchSize boundary without extra chunk", async () => {
      const fetchMock = mockFetchCreateAll();
      globalThis.fetch = fetchMock;

      const client = createClient(5);
      const records = Array.from({ length: 10 }, (_, i) =>
        makeRecord(`hs-${i}`),
      );

      const result = await client.upsertBatch(records);

      // 2 chunks of exactly 5, 20 fetch calls
      expect(result.successful).toBe(10);
      expect(fetchMock).toHaveBeenCalledTimes(20);
    });
  });

  // ── Search-then-mutate pattern ────────────────────────────────────

  describe("search-then-mutate pattern", () => {
    it("creates a new record when search returns no results", async () => {
      const fetchMock = mockFetchForUpsert(null); // no existing record
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      await client.upsertBatch([makeRecord("hs-new", "tenant", { customerStatus: "ACTIVE" })]);

      expect(fetchMock).toHaveBeenCalledTimes(2);

      // First call should be a search query
      const searchCall = fetchMock.mock.calls[0]!;
      const searchBody = JSON.parse(searchCall[1].body);
      expect(searchBody.query).toContain("query Find");
      expect(searchBody.variables.filter).toEqual({
        hubspotRecordId: { eq: "hs-new" },
      });

      // Second call should be a create mutation
      const createCall = fetchMock.mock.calls[1]!;
      const createBody = JSON.parse(createCall[1].body);
      expect(createBody.query).toContain("createTenant");
      expect(createBody.variables.data).toMatchObject({
        hubspotRecordId: "hs-new",
        customerStatus: "ACTIVE",
      });
    });

    it("updates an existing record when search returns a result", async () => {
      const fetchMock = mockFetchForUpsert("twenty-existing-123"); // existing record
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      await client.upsertBatch([makeRecord("hs-existing", "contract", { contractId: "C-001" })]);

      expect(fetchMock).toHaveBeenCalledTimes(2);

      // Second call should be an update mutation
      const updateCall = fetchMock.mock.calls[1]!;
      const updateBody = JSON.parse(updateCall[1].body);
      expect(updateBody.query).toContain("updateContract");
      expect(updateBody.variables.id).toBe("twenty-existing-123");
      expect(updateBody.variables.data).toMatchObject({
        hubspotRecordId: "hs-existing",
        contractId: "C-001",
      });
    });

    it("includes hubspotRecordId in the mutation data", async () => {
      const fetchMock = mockFetchForUpsert(null);
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      await client.upsertBatch([makeRecord("hs-1234", "room", { roomId: "R-001" })]);

      const createCall = fetchMock.mock.calls[1]!;
      const createBody = JSON.parse(createCall[1].body);
      expect(createBody.variables.data.hubspotRecordId).toBe("hs-1234");
    });
  });

  // ── Individual record failure (Promise.allSettled) ──────────────────

  describe("individual record failure handling", () => {
    it("continues processing when one record in a chunk fails", async () => {
      let recordIndex = 0;
      globalThis.fetch = vi.fn().mockImplementation((_url: string, options: { body: string }) => {
        const body = JSON.parse(options.body);
        const queryStr = body.query as string;
        const isSearch = queryStr.includes("query Find");

        if (isSearch) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { people: { edges: [] } },
            }),
            text: () => Promise.resolve("{}"),
          });
        }

        // This is a create mutation
        recordIndex++;
        if (recordIndex === 3) {
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
            Promise.resolve({ data: { createPerson: { id: "twenty-ok" } } }),
          text: () =>
            Promise.resolve(JSON.stringify({ data: { createPerson: { id: "twenty-ok" } } })),
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
      expect(result.errors[0]!.error).toContain("Duplicate record");
    });

    it("handles fetch rejection (network error) for individual records", async () => {
      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        // Fail the search of the 2nd record (calls 3-4 are for record 2)
        if (callCount === 3) {
          return Promise.reject(new Error("Network timeout"));
        }

        // Default: return search-empty or create-success
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              people: { edges: [] },
              createPerson: { id: "twenty-ok" },
            },
          }),
          text: () => Promise.resolve("{}"),
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
      const fetchMock = mockFetchCreateAll();
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
      const fetchMock = mockFetchCreateAll();
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      await client.upsertBatch([makeRecord("hs-auth")]);

      // At least 2 calls: search + create
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const [url, options] = fetchMock.mock.calls[0]!;
      expect(url).toBe("https://crm.test.example/api/graphql");
      expect(options.method).toBe("POST");
      expect(options.headers).toMatchObject({
        Authorization: "Bearer test-api-key",
        "Content-Type": "application/json",
      });
    });

    it("includes hubspotRecordId in create mutation variables", async () => {
      const fetchMock = mockFetchForUpsert(null);
      globalThis.fetch = fetchMock;

      const client = createClient(60);
      await client.upsertBatch([
        makeRecord("hs-shape", "contract", { contractId: "C-001" }),
      ]);

      // The create mutation is the second call
      const [, options] = fetchMock.mock.calls[1]!;
      const body = JSON.parse(options.body as string);
      expect(body.variables.data).toMatchObject({
        hubspotRecordId: "hs-shape",
        contractId: "C-001",
      });
    });

    it("uses correct GraphQL type names for each object type", async () => {
      const fetchMock = mockFetchCreateAll();
      globalThis.fetch = fetchMock;

      const client = createClient(60);

      // Test various object types
      const testCases: Array<{ objectType: TwentyRecord["objectType"]; expectedCreate: string; expectedPlural: string }> = [
        { objectType: "person", expectedCreate: "createPerson", expectedPlural: "people" },
        { objectType: "tenant", expectedCreate: "createTenant", expectedPlural: "tenants" },
        { objectType: "landlord", expectedCreate: "createLandlord", expectedPlural: "landlords" },
        { objectType: "contract", expectedCreate: "createContract", expectedPlural: "contracts" },
        { objectType: "property", expectedCreate: "createProperty", expectedPlural: "properties" },
        { objectType: "room", expectedCreate: "createRoom", expectedPlural: "rooms" },
        { objectType: "ticket", expectedCreate: "createTicket", expectedPlural: "tickets" },
        { objectType: "opportunity", expectedCreate: "createOpportunity", expectedPlural: "opportunities" },
      ];

      for (const tc of testCases) {
        fetchMock.mockClear();
        await client.upsertBatch([makeRecord(`hs-${tc.objectType}`, tc.objectType)]);

        // Check search query uses plural name
        const searchBody = JSON.parse(fetchMock.mock.calls[0]![1].body);
        expect(searchBody.query).toContain(tc.expectedPlural);

        // Check create mutation uses correct name
        const createBody = JSON.parse(fetchMock.mock.calls[1]![1].body);
        expect(createBody.query).toContain(tc.expectedCreate);
      }
    });
  });
});
