"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Key01, LogIn01, AlertCircle, CheckCircle, Mail01, Lock01 } from "@untitledui/icons";
import { setStoredToken } from "@/lib/auth";
import { metadataQuery } from "@/lib/twenty/graphql-client";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

interface WorkspaceInfo {
  id: string;
  displayName: string;
  logo?: string | null;
}

interface SignUpResponse {
  signUpInWorkspace: {
    loginToken: { token: string };
    workspace: { id: string };
  };
}

interface GetAuthTokensResponse {
  getAuthTokensFromLoginToken: {
    tokens: {
      accessOrWorkspaceAgnosticToken: { token: string };
      refreshToken: { token: string };
    };
  };
}

const WORKSPACE_FROM_HASH_QUERY = `
  query FindWorkspaceFromInviteHash($inviteHash: String!) {
    findWorkspaceFromInviteHash(inviteHash: $inviteHash) {
      id
      displayName
      logo
    }
  }
`;

const SIGN_UP_MUTATION = `
  mutation SignUpInWorkspace(
    $email: String!
    $password: String!
    $workspaceInviteHash: String!
  ) {
    signUpInWorkspace(
      email: $email
      password: $password
      workspaceInviteHash: $workspaceInviteHash
    ) {
      loginToken { token }
      workspace { id }
    }
  }
`;

const GET_AUTH_TOKENS_MUTATION = `
  mutation GetAuthTokensFromLoginToken($loginToken: String!) {
    getAuthTokensFromLoginToken(loginToken: $loginToken) {
      tokens {
        accessOrWorkspaceAgnosticToken { token }
        refreshToken { token }
      }
    }
  }
`;

export default function InvitePage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = use(params);
  const router = useRouter();

  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [validating, setValidating] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate invite hash on mount
  useEffect(() => {
    if (!hash) return;
    metadataQuery<{ findWorkspaceFromInviteHash: WorkspaceInfo }>(
      WORKSPACE_FROM_HASH_QUERY,
      { inviteHash: hash },
    )
      .then((data) => {
        if (!data.findWorkspaceFromInviteHash) {
          setWorkspaceError("This invite link is invalid or has expired.");
        } else {
          setWorkspace(data.findWorkspaceFromInviteHash);
        }
      })
      .catch((err) => {
        setWorkspaceError(
          err instanceof Error ? err.message : "Failed to validate invite.",
        );
      })
      .finally(() => setValidating(false));
  }, [hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!email.trim() || !password) {
      setSubmitError("Please enter both email and password.");
      return;
    }

    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Sign up in workspace
      const signUpData = await metadataQuery<SignUpResponse>(SIGN_UP_MUTATION, {
        email: email.trim(),
        password,
        workspaceInviteHash: hash,
      });

      const loginToken = signUpData.signUpInWorkspace.loginToken.token;

      // Step 2: Exchange login token for access token
      const tokensData = await metadataQuery<GetAuthTokensResponse>(
        GET_AUTH_TOKENS_MUTATION,
        { loginToken },
      );

      const accessToken =
        tokensData.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token;

      // Step 3: Store as auth token and redirect
      setStoredToken(accessToken);
      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign up failed. Please try again.";
      // Clean up common GraphQL error prefixes
      setSubmitError(
        message.replace(/^(Metadata error: |GraphQL error: )/, ""),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-secondary px-4">
        <LoadingIndicator size="md" label="Validating invite..." />
      </div>
    );
  }

  // Invalid invite
  if (workspaceError || !workspace) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-secondary px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-xl bg-primary p-6 text-center shadow-lg ring-1 ring-secondary">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-error-secondary">
              <AlertCircle className="size-6 text-fg-error-primary" />
            </div>
            <h1 className="text-lg font-semibold text-primary">
              Invalid invite link
            </h1>
            <p className="mt-2 text-sm text-tertiary">
              {workspaceError ||
                "This invite link is no longer valid. Ask your admin for a new one."}
            </p>
            <Button
              size="md"
              color="secondary"
              onClick={() => router.push("/login")}
              className="mt-5 w-full"
            >
              Go to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-secondary px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-brand-secondary">
            <CheckCircle className="size-7 text-fg-white" />
          </div>
          <h1 className="text-display-xs font-semibold text-primary">
            Join {workspace.displayName}
          </h1>
          <p className="mt-2 text-sm text-tertiary">
            Create your account to access the workspace.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl bg-primary p-6 shadow-lg ring-1 ring-secondary">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Work email"
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={setEmail}
              isRequired
              isInvalid={!!submitError}
              icon={Mail01}
              size="md"
              autoComplete="email"
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              type="password"
              value={password}
              onChange={setPassword}
              isRequired
              isInvalid={!!submitError}
              icon={Lock01}
              size="md"
              autoComplete="new-password"
            />

            {submitError && (
              <div className="flex items-start gap-2 rounded-lg bg-error-primary p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-fg-error-secondary" />
                <p className="text-sm text-error-primary">{submitError}</p>
              </div>
            )}

            <Button
              type="submit"
              size="md"
              color="primary"
              isLoading={submitting}
              showTextWhileLoading
              iconLeading={LogIn01}
              className="w-full"
            >
              Create account & join
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-quaternary">
          Already a member?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-semibold text-brand-secondary hover:text-brand-secondary_hover"
          >
            Sign in with API key
          </button>
        </p>
      </div>
    </div>
  );
}
