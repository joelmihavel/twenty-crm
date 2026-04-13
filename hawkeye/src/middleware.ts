import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "hawkeye_api_key";

// Routes that do not require authentication
const PUBLIC_PATHS = ["/login"];

// Prefixes that skip auth (Next.js internals, static assets, APIs, invite links)
const SKIP_PREFIXES = ["/_next", "/bff", "/favicon", "/icon", "/invite"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for public paths
  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Skip auth for static assets and Next.js internals
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Skip if file extensions (e.g., .png, .css, .js)
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check for token in cookie
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  // Also check env var - if NEXT_PUBLIC_TWENTY_API_KEY is set, allow access
  // (handles the case where the app is pre-configured with a key)
  const envKey = process.env.NEXT_PUBLIC_TWENTY_API_KEY || process.env.TWENTY_API_KEY;

  if (!token && !envKey) {
    // No auth available, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|icon.png).*)",
  ],
};
