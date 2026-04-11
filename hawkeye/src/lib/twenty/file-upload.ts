/**
 * Upload utilities for Twenty's GraphQL multipart request spec.
 * @see https://github.com/jaydenseric/graphql-multipart-request-spec
 */

export interface UploadResult {
  id: string;
  url: string;
}

/**
 * Upload a file to Twenty using GraphQL multipart request spec.
 * Sends requests through the local proxy at /api/twenty/upload
 * to avoid exposing API keys on the client.
 */
export async function uploadFile(
  file: File,
  mutation: string,
  variablePath: string = "variables.file",
  extraVariables?: Record<string, unknown>,
): Promise<UploadResult> {
  const formData = new FormData();

  const variables: Record<string, unknown> = { file: null, ...extraVariables };

  formData.append(
    "operations",
    JSON.stringify({
      query: mutation,
      variables,
    }),
  );
  formData.append(
    "map",
    JSON.stringify({ "0": [variablePath] }),
  );
  formData.append("0", file);

  const res = await fetch("/api/twenty/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(
      json.errors.map((e: { message: string }) => e.message).join("; "),
    );
  }

  // Extract the result from the first mutation result key
  const data = json.data;
  const resultKey = Object.keys(data)[0];
  return data[resultKey] as UploadResult;
}

/**
 * Upload a workspace member profile picture.
 */
export async function uploadProfilePicture(file: File): Promise<UploadResult> {
  return uploadFile(
    file,
    `mutation UploadWorkspaceMemberProfilePicture($file: Upload!) {
      uploadWorkspaceMemberProfilePicture(file: $file) { id url }
    }`,
  );
}

/**
 * Upload a file for a FILES-type field on a record.
 */
export async function uploadAttachmentFile(
  file: File,
  fieldMetadataId: string,
): Promise<UploadResult> {
  return uploadFile(
    file,
    `mutation UploadFilesFieldFile($file: Upload!, $fieldMetadataId: String!) {
      uploadFilesFieldFile(file: $file, fieldMetadataId: $fieldMetadataId) { id url }
    }`,
    "variables.file",
    { fieldMetadataId },
  );
}
