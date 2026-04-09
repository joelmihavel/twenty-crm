import { Storage } from "@google-cloud/storage";
import type { Checkpoint } from "./types.js";

const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000; // 24 hours

export class CheckpointManager {
  private readonly storage: Storage;
  private readonly bucket: string;
  private readonly filePath: string;

  constructor(bucket: string, filePath: string) {
    this.storage = new Storage();
    this.bucket = bucket;
    this.filePath = filePath;
  }

  /**
   * Read the last checkpoint from GCS.
   * Returns a default checkpoint (24h ago) if the file doesn't exist or is corrupt.
   */
  async read(): Promise<Checkpoint> {
    try {
      const file = this.storage.bucket(this.bucket).file(this.filePath);
      const [exists] = await file.exists();

      if (!exists) {
        console.info("[Checkpoint] No checkpoint file found, using default (24h ago)");
        return CheckpointManager.createDefault();
      }

      const [content] = await file.download();
      const checkpoint = JSON.parse(content.toString()) as Checkpoint;

      // Validate the parsed checkpoint has required fields
      if (!checkpoint.lastSyncTimestamp || !checkpoint.lastSyncEpochMs) {
        console.warn("[Checkpoint] Invalid checkpoint data, using default");
        return CheckpointManager.createDefault();
      }

      console.info(`[Checkpoint] Loaded: last sync at ${checkpoint.lastSyncTimestamp}`);
      return checkpoint;
    } catch (error) {
      console.error("[Checkpoint] Error reading checkpoint, using default:", error);
      return CheckpointManager.createDefault();
    }
  }

  /**
   * Write a checkpoint to GCS.
   */
  async write(checkpoint: Checkpoint): Promise<void> {
    const file = this.storage.bucket(this.bucket).file(this.filePath);
    const content = JSON.stringify(checkpoint, null, 2);
    await file.save(content, {
      contentType: "application/json",
      resumable: false,
    });
    console.info(`[Checkpoint] Saved: last sync at ${checkpoint.lastSyncTimestamp}`);
  }

  /**
   * Create a checkpoint with the current time.
   */
  static createNow(): Checkpoint {
    const now = new Date();
    return {
      lastSyncTimestamp: now.toISOString(),
      lastSyncEpochMs: now.getTime(),
      objectCheckpoints: {},
    };
  }

  /**
   * Create a default checkpoint 24 hours ago.
   */
  static createDefault(): Checkpoint {
    const date = new Date(Date.now() - DEFAULT_LOOKBACK_MS);
    return {
      lastSyncTimestamp: date.toISOString(),
      lastSyncEpochMs: date.getTime(),
      objectCheckpoints: {},
    };
  }
}
