import { cookies } from "next/headers";

export const ADMIN_USER = process.env.DASHBOARD_USER || "admin";
export const ADMIN_PASS = process.env.DASHBOARD_PASS || "admin";
export const SESSION_COOKIE = "tandt_dashboard_session";

/**
 * Keep this a fixed string so Edge middleware and Node API always match.
 * (Middleware often cannot read runtime Docker env vars.)
 */
export const SESSION_VALUE = "tandt-admin-session-v1";

export function createSessionToken() {
  return SESSION_VALUE;
}

export function verifySessionToken(token: string | undefined | null) {
  return Boolean(token && token === SESSION_VALUE);
}

export function validateCredentials(username: string, password: string) {
  return username.trim() === ADMIN_USER && password === ADMIN_PASS;
}

export async function isAuthenticated() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(request?: Request, maxAge = 60 * 60 * 24 * 7) {
  const forwardedProto = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const forceSecure = process.env.COOKIE_SECURE === "true";
  const forceInsecure = process.env.COOKIE_SECURE === "false";

  let secure = false;
  if (forceInsecure) {
    secure = false;
  } else if (forceSecure) {
    secure = true;
  } else if (forwardedProto === "https" || appUrl.startsWith("https://")) {
    secure = true;
  }

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge,
  };
}
