import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "tandt_dashboard_session";
/** Must match lib/dashboard/auth.ts SESSION_VALUE exactly */
const SESSION_VALUE = "tandt-admin-session-v1";

function isAuthed(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard/login")) {
    if (isAuthed(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isAuthed(request)) {
      const loginUrl = new URL("/dashboard/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    pathname.startsWith("/api/dashboard") &&
    !pathname.startsWith("/api/dashboard/login")
  ) {
    if (!isAuthed(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/api/dashboard/:path*"],
};
