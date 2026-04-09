import { describe, it, expect, vi, beforeEach } from "vitest";
import { HubSpotClient } from "../src/hubspot-client.js";
import type { HubSpotSearchResponse } from "../src/types.js";

// ── Mock global fetch ────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
  } as unknown as Response;
}

describe("HubSpotClient", () => {
  let client: HubSpotClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new HubSpotClient({
      apiKey: "test-hs-key",
      baseUrl: "https://api.hubapi.com",
      maxRetries: 3,
    });
  });

  it("fetches records from the search endpoint with correct headers", async () => {
    const body: HubSpotSearchResponse = {
      total: 1,
      results: [
        {
          id: "1",
          properties: { firstname: "Test" },
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-06-01T00:00:00Z",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce(jsonResponse(body));

    const results = await client.searchModifiedSince(
      "contacts",
      "2025-01-01T00:00:00Z",
      ["firstname", "lastname"],
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.hubapi.com/crm/v3/objects/contacts/search");
    expect(opts.method).toBe("POST");
    expect(opts.headers).toMatchObject({
      Authorization: "Bearer test-hs-key",
      "Content-Type": "application/json",
    });

    expect(results).toHaveLength(1);
    expect(results[0]!.properties.firstname).toBe("Test");
  });

  it("paginates through multiple pages", async () => {
    const page1: HubSpotSearchResponse = {
      total: 3,
      results: [
        { id: "1", properties: {}, createdAt: "", updatedAt: "" },
        { id: "2", properties: {}, createdAt: "", updatedAt: "" },
      ],
      paging: { next: { after: "2" } },
    };
    const page2: HubSpotSearchResponse = {
      total: 3,
      results: [
        { id: "3", properties: {}, createdAt: "", updatedAt: "" },
      ],
    };

    mockFetch
      .mockResolvedValueOnce(jsonResponse(page1))
      .mockResolvedValueOnce(jsonResponse(page2));

    const results = await client.searchModifiedSince(
      "contacts",
      "2025-01-01T00:00:00Z",
      ["firstname"],
    );

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(3);
  });

  it("retries on 429 with exponential backoff", async () => {
    const rateLimitResponse = jsonResponse({ message: "Rate limit" }, 429);
    const successBody: HubSpotSearchResponse = {
      total: 1,
      results: [
        { id: "1", properties: {}, createdAt: "", updatedAt: "" },
      ],
    };

    mockFetch
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(jsonResponse(successBody));

    // Use a client with short delays for testing
    const fastClient = new HubSpotClient({
      apiKey: "test-hs-key",
      baseUrl: "https://api.hubapi.com",
      maxRetries: 3,
      baseDelayMs: 10, // 10ms base delay for testing
    });

    const results = await fastClient.searchModifiedSince(
      "contacts",
      "2025-01-01T00:00:00Z",
      ["firstname"],
    );

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(1);
  });

  it("throws after exhausting retries on 429", async () => {
    const rateLimitResponse = jsonResponse({ message: "Rate limit" }, 429);

    mockFetch
      .mockResolvedValue(rateLimitResponse);

    const fastClient = new HubSpotClient({
      apiKey: "test-hs-key",
      baseUrl: "https://api.hubapi.com",
      maxRetries: 3,
      baseDelayMs: 10,
    });

    await expect(
      fastClient.searchModifiedSince("contacts", "2025-01-01T00:00:00Z", ["firstname"]),
    ).rejects.toThrow(/429/);

    // Initial request + 3 retries = 4 total calls
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it("throws on non-429 errors without retrying", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ message: "Server Error" }, 500));

    await expect(
      client.searchModifiedSince("contacts", "2025-01-01T00:00:00Z", ["firstname"]),
    ).rejects.toThrow(/500/);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
