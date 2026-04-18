import { describe, it, expect, vi, beforeEach } from "vitest";
import { CheckpointManager } from "../src/checkpoint.js";
import type { Checkpoint } from "../src/types.js";

// ── Mock @google-cloud/storage ───────────────────────────────────────

const mockDownload = vi.fn();
const mockSave = vi.fn();
const mockExists = vi.fn();

const mockFile = {
  download: mockDownload,
  save: mockSave,
  exists: mockExists,
};

const mockBucket = {
  file: vi.fn(() => mockFile),
};

vi.mock("@google-cloud/storage", () => ({
  Storage: vi.fn(() => ({
    bucket: vi.fn(() => mockBucket),
  })),
}));

describe("CheckpointManager", () => {
  let manager: CheckpointManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new CheckpointManager("test-bucket", "checkpoint.json");
  });

  it("returns a default checkpoint when no file exists", async () => {
    mockExists.mockResolvedValueOnce([false]);

    const checkpoint = await manager.read();

    expect(checkpoint.lastSyncTimestamp).toBeDefined();
    expect(checkpoint.lastSyncEpochMs).toBeGreaterThan(0);
    // Default should be ~24 hours ago
    const now = Date.now();
    const diff = now - checkpoint.lastSyncEpochMs;
    expect(diff).toBeGreaterThanOrEqual(23 * 60 * 60 * 1000);
    expect(diff).toBeLessThanOrEqual(25 * 60 * 60 * 1000);
  });

  it("reads an existing checkpoint from GCS", async () => {
    const stored: Checkpoint = {
      lastSyncTimestamp: "2025-06-01T10:00:00Z",
      lastSyncEpochMs: new Date("2025-06-01T10:00:00Z").getTime(),
      objectCheckpoints: {},
    };

    mockExists.mockResolvedValueOnce([true]);
    mockDownload.mockResolvedValueOnce([Buffer.from(JSON.stringify(stored))]);

    const checkpoint = await manager.read();

    expect(checkpoint.lastSyncTimestamp).toBe("2025-06-01T10:00:00Z");
    expect(checkpoint.lastSyncEpochMs).toBe(new Date("2025-06-01T10:00:00Z").getTime());
  });

  it("writes a checkpoint to GCS", async () => {
    const checkpoint: Checkpoint = {
      lastSyncTimestamp: "2025-06-02T12:00:00Z",
      lastSyncEpochMs: new Date("2025-06-02T12:00:00Z").getTime(),
      objectCheckpoints: {},
    };

    mockSave.mockResolvedValueOnce(undefined);

    await manager.write(checkpoint);

    expect(mockSave).toHaveBeenCalledTimes(1);
    const savedContent = mockSave.mock.calls[0]![0] as string;
    const parsed = JSON.parse(savedContent) as Checkpoint;
    expect(parsed.lastSyncTimestamp).toBe("2025-06-02T12:00:00Z");
  });

  it("handles corrupted checkpoint file gracefully", async () => {
    mockExists.mockResolvedValueOnce([true]);
    mockDownload.mockResolvedValueOnce([Buffer.from("not valid json{{{")]);

    const checkpoint = await manager.read();

    // Should fall back to default
    expect(checkpoint.lastSyncTimestamp).toBeDefined();
    expect(checkpoint.lastSyncEpochMs).toBeGreaterThan(0);
  });

  it("creates an updated checkpoint with current time", () => {
    const before = Date.now();
    const checkpoint = CheckpointManager.createNow();
    const after = Date.now();

    expect(checkpoint.lastSyncEpochMs).toBeGreaterThanOrEqual(before);
    expect(checkpoint.lastSyncEpochMs).toBeLessThanOrEqual(after);
    expect(checkpoint.lastSyncTimestamp).toBeDefined();
  });
});
