import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = process.env.TWENTY_GRAPHQL_URL;

export async function POST(request: NextRequest) {
  if (!GRAPHQL_URL) {
    return NextResponse.json(
      { error: "TWENTY_GRAPHQL_URL is not configured" },
      { status: 500 },
    );
  }

  // Priority: client-sent Authorization header (for login validation) > cookie > env var
  const authHeader = request.headers.get("Authorization");
  const clientToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookieToken = request.cookies.get("hawkeye_api_key")?.value;
  const apiKey = clientToken || cookieToken || process.env.TWENTY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key available" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proxy request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
