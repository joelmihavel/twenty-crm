"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Key01, LogIn01, AlertCircle } from "@untitledui/icons";
import { setStoredToken, getStoredToken } from "@/lib/auth";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";

export default function LoginPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingToken, setExistingToken] = useState<string | null>(null);

  // Check for existing token in useEffect to avoid SSR mismatch (Fix 25)
  useEffect(() => {
    const token = getStoredToken();
    setExistingToken(token);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError("Please enter an API key.");
      return;
    }

    setLoading(true);

    try {
      // Validate the API key via the proxy route (sends key via Authorization header)
      const res = await fetch("/api/twenty/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${trimmedKey}`,
        },
        body: JSON.stringify({
          query: `{ objects(paging: { first: 1 }) { edges { node { id } } } }`,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}. Check your API key.`);
      }

      const json = await res.json();
      if (json.errors?.length) {
        throw new Error(json.errors[0].message);
      }

      // Key is valid, store it and redirect
      setStoredToken(trimmedKey);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to validate API key. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-secondary">
            <Key01 className="size-6 text-fg-white" />
          </div>
          <h1 className="text-display-xs font-semibold text-primary">
            Sign in to Hawkeye
          </h1>
          <p className="mt-2 text-sm text-tertiary">
            Enter your Twenty API key to access the CRM.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-primary p-6 shadow-lg ring-1 ring-secondary">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="API Key"
              placeholder="eyJhbGciOiJIUzI1NiIs..."
              type="password"
              value={apiKey}
              onChange={setApiKey}
              isRequired
              isInvalid={!!error}
              icon={Key01}
              size="md"
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-error-primary p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-fg-error-secondary" />
                <p className="text-sm text-error-primary">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="md"
              color="primary"
              isLoading={loading}
              showTextWhileLoading
              iconLeading={LogIn01}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          {existingToken && (
            <div className="mt-4 border-t border-secondary pt-4">
              <Button
                size="sm"
                color="link-color"
                onClick={() => router.push("/")}
                className="w-full"
              >
                Continue with existing session
              </Button>
            </div>
          )}
        </div>

        {/* Footer help */}
        <p className="mt-6 text-center text-xs text-quaternary">
          You can find your API key in Twenty under Settings &rarr; API Keys.
        </p>
      </div>
    </div>
  );
}
