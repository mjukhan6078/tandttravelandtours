import { cookies } from "next/headers";

export const ADMIN_USER = "admin";
export const ADMIN_PASS = "admin";
export const SESSION_COOKIE = "tandt_dashboard_session";

/** Static session token for admin cookie (Edge-compatible). */
export const SESSION_VALUE =
  process.env.DASHBOARD_SESSION_TOKEN || "tandt-admin-session-v1";

export function createSessionToken() {
  return SESSION_VALUE;
}

export function verifySessionToken(token: string | undefined | null) {
  return Boolean(token && token === SESSION_VALUE);
}

export function validateCredentials(username: string, password: string) {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export async function isAuthenticated() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
