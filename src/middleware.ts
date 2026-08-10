import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

// Fast, edge-safe first pass: block obviously-unauthenticated requests to the
// protected app shell. Full session validity (expiry, revocation, account
// status, mustChangePassword) is re-checked against the database in the
// (app) route group's layout, which runs on the Node.js runtime.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/employees",
  "/approvals",
  "/my-requests",
  "/audit-log",
  "/settings",
  "/profile",
  "/change-password",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/verify-otp") && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/approvals/:path*",
    "/my-requests/:path*",
    "/audit-log/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/change-password",
    "/login",
    "/verify-otp",
  ],
};
