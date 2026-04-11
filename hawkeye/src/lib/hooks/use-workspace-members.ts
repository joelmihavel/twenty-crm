"use client";

import { useCallback, useEffect, useState } from "react";
import { graphqlQuery } from "../twenty/graphql-client";
import { metadataQuery } from "../twenty/graphql-client";

export interface WorkspaceMemberSummary {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  avatarUrl: string | null;
  userEmail: string;
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  expiresAt: string;
}

// ── Fetch workspace members ──────────────────────────────────────────

const MEMBERS_QUERY = `{
  workspaceMembers(first: 100) {
    edges {
      node {
        id
        name { firstName lastName }
        avatarUrl
        userEmail
      }
    }
  }
}`;

export function useWorkspaceMembers() {
  const [members, setMembers] = useState<WorkspaceMemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    graphqlQuery<{
      workspaceMembers: { edges: { node: WorkspaceMemberSummary }[] };
    }>(MEMBERS_QUERY)
      .then((data) => {
        setMembers(data.workspaceMembers.edges.map((e) => e.node));
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading, error, refetch: fetchMembers };
}

// ── Fetch pending invitations ────────────────────────────────────────

const INVITATIONS_QUERY = `{
  findWorkspaceInvitations {
    id
    email
    expiresAt
  }
}`;

export function useWorkspaceInvitations() {
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvitations = useCallback(() => {
    setLoading(true);
    metadataQuery<{ findWorkspaceInvitations: WorkspaceInvitation[] }>(INVITATIONS_QUERY)
      .then((data) => {
        setInvitations(data.findWorkspaceInvitations ?? []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return { invitations, loading, error, refetch: fetchInvitations };
}

// ── Mutations ────────────────────────────────────────────────────────

const SEND_INVITATION_MUTATION = `
  mutation SendInvitations($emails: [String!]!) {
    sendInvitations(emails: $emails) {
      success
      errors
      result {
        ... on WorkspaceInvitation {
          id
          email
          expiresAt
        }
      }
    }
  }
`;

export async function sendInvitation(email: string): Promise<void> {
  const data = await metadataQuery<{
    sendInvitations: { success: boolean; errors: string[] | null };
  }>(SEND_INVITATION_MUTATION, { emails: [email] });

  if (!data.sendInvitations.success) {
    throw new Error(
      data.sendInvitations.errors?.join("; ") || "Failed to send invitation",
    );
  }
}

const DELETE_INVITATION_MUTATION = `
  mutation DeleteWorkspaceInvitation($appTokenId: String!) {
    deleteWorkspaceInvitation(appTokenId: $appTokenId)
  }
`;

export async function deleteInvitation(id: string): Promise<void> {
  await metadataQuery(DELETE_INVITATION_MUTATION, { appTokenId: id });
}

const REMOVE_MEMBER_MUTATION = `
  mutation DeleteUserFromWorkspace($workspaceMemberIdToDelete: String!) {
    deleteUserFromWorkspace(workspaceMemberIdToDelete: $workspaceMemberIdToDelete) {
      id
    }
  }
`;

export async function removeMember(id: string): Promise<void> {
  await metadataQuery(REMOVE_MEMBER_MUTATION, {
    workspaceMemberIdToDelete: id,
  });
}
