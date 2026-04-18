"use client";

import { useState, useCallback } from "react";
import { uploadProfilePicture, uploadAttachmentFile } from "@/lib/twenty/file-upload";
import type { UploadResult } from "@/lib/twenty/file-upload";
import { useToast } from "./use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const upload = useCallback(
    async (
      file: File,
      type: "profile" | "attachment",
      fieldMetadataId?: string,
    ): Promise<UploadResult> => {
      setUploading(true);
      setProgress(0);

      try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error("File size must be under 10MB");
        }

        // Simulated progress since fetch does not expose upload progress
        setProgress(50);

        let result: UploadResult;
        if (type === "profile") {
          result = await uploadProfilePicture(file);
        } else if (type === "attachment" && fieldMetadataId) {
          result = await uploadAttachmentFile(file, fieldMetadataId);
        } else {
          throw new Error("Invalid upload type or missing fieldMetadataId");
        }

        setProgress(100);
        toast("File uploaded successfully", "success");
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast(message, "error");
        throw err;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [toast],
  );

  return { upload, uploading, progress };
}
