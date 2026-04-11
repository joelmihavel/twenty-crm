"use client";

import { useCallback, useEffect, useState } from "react";
import { graphqlQuery } from "../twenty/graphql-client";

// Re-export uploadProfilePicture from the centralized file-upload module
// so existing consumers of this module continue to work.
export { uploadProfilePicture } from "../twenty/file-upload";

export interface WorkspaceMember {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  avatarUrl: string | null;
  userEmail: string;
  locale: string;
}

export interface WorkspaceMemberUpdateData {
  name?: { firstName?: string; lastName?: string };
  locale?: string;
  avatarUrl?: string;
}

const UPDATE_MEMBER_MUTATION = `
  mutation UpdateWorkspaceMember($id: UUID!, $data: WorkspaceMemberUpdateInput!) {
    updateWorkspaceMember(id: $id, data: $data) {
      id
      name { firstName lastName }
      avatarUrl
      userEmail
      locale
    }
  }
`;

export async function updateMember(
  id: string,
  data: WorkspaceMemberUpdateData,
): Promise<WorkspaceMember> {
  const result = await graphqlQuery<{ updateWorkspaceMember: WorkspaceMember }>(
    UPDATE_MEMBER_MUTATION,
    { id, data },
  );
  return result.updateWorkspaceMember;
}

export function useWorkspaceMember() {
  const [member, setMember] = useState<WorkspaceMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMember = useCallback(() => {
    // API keys don't have "currentWorkspaceMember" — query workspaceMembers
    // and return the first one (workspace owner in single-user setups)
    const query = `{
      workspaceMembers(first: 1) {
        edges {
          node {
            id
            name { firstName lastName }
            avatarUrl
            userEmail
            locale
          }
        }
      }
    }`;

    setLoading(true);
    graphqlQuery<{
      workspaceMembers: { edges: { node: WorkspaceMember }[] };
    }>(query)
      .then((data) => {
        const first = data.workspaceMembers?.edges?.[0]?.node ?? null;
        setMember(first);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  return { member, setMember, loading, error, refetch: fetchMember };
}
