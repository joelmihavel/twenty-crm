import { NextRequest, NextResponse } from "next/server";

const METADATA_URL = process.env.TWENTY_METADATA_URL;

export async function POST(request: NextRequest) {
  if (!METADATA_URL) {
    return NextResponse.json(
      { error: "TWENTY_METADATA_URL is not configured" },
      { status: 500 },
    );
  }

  // Priority: client-sent Authorization header (for login validation) > cookie > env var
  const authHeader = request.headers.get("Authorization");
  const clientToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookieToken = request.cookies.get("hawkeye_api_key")?.value;
  const apiKey = clientToken || cookieToken || process.env.TWENTY_API_KEY;

  // NOTE: Metadata endpoint supports some unauthenticated operations
  // (findWorkspaceFromInviteHash, signUpInWorkspace, getAuthTokensFromLoginToken).
  // If no API key is available, forward the request without Authorization header
  // so these public mutations still work.

  try {
    const body = await request.json();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(METADATA_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proxy request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
