const TOKEN_KEY = "hawkeye_api_key";

// Client-side token management via localStorage
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Add Secure flag when not on localhost (Fix 3)
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const secureFlag = isLocalhost ? "" : " Secure;";
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax;${secureFlag}`;
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

// Get the effective API key: user token > public env var > server-side env var
export function getEffectiveApiKey(): string {
  const userToken = getStoredToken();
  if (userToken) return userToken;
  return process.env.NEXT_PUBLIC_TWENTY_API_KEY || process.env.TWENTY_API_KEY || "";
}

// Parse a cookie string to extract the token (used in middleware)
export function getTokenFromCookieString(cookieString: string): string | null {
  const match = cookieString.match(new RegExp(`(?:^|;\\s*)${TOKEN_KEY}=([^;]*)`));
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  return value || null;
}
