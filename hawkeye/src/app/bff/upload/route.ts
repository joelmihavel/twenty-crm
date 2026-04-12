import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = process.env.TWENTY_GRAPHQL_URL;

export async function POST(request: NextRequest) {
  if (!GRAPHQL_URL) {
    return NextResponse.json(
      { error: "TWENTY_GRAPHQL_URL is not configured" },
      { status: 500 },
    );
  }

  const cookieToken = request.cookies.get("hawkeye_api_key")?.value;
  const apiKey = cookieToken || process.env.TWENTY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key available" },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();

    // Forward the multipart form data directly to Twenty's GraphQL endpoint
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload proxy request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
