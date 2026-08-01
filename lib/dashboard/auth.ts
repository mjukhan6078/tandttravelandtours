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

function requestIsHttps(request?: Request) {
  if (!request) return false;
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwarded === "https") return true;
  if (forwarded === "http") return false;
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function sessionCookieOptions(request?: Request, maxAge = 60 * 60 * 24 * 7) {
  // Always follow the real request protocol so http://IP:3090 login works,
  // while https://domain (NPM) still gets Secure cookies.
  const secure =
    process.env.COOKIE_SECURE === "false" ? false : requestIsHttps(request);

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge,
  };
}
