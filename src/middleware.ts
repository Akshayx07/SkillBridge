import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Public routes that don't require authentication ────────────────────────
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/error", "/api/auth"];

// ─── Role-to-dashboard mapping ──────────────────────────────────────────────
const DASHBOARD_ROLES = ["student", "industry", "academician", "admin"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow public routes
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // If no token, redirect to login (handled by withAuth, but safety net)
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based dashboard access
    if (pathname.startsWith("/dashboard/")) {
      const segments = pathname.split("/");
      const dashboardRole = segments[2]; // /dashboard/[role]

      if (dashboardRole && DASHBOARD_ROLES.includes(dashboardRole)) {
        const userRole = (token.role as string)?.toLowerCase();

        // Admin can access all dashboards
        if (userRole === "admin") {
          return NextResponse.next();
        }

        // Users can only access their own role dashboard
        if (dashboardRole !== userRole) {
          return NextResponse.redirect(
            new URL(`/dashboard/${userRole}`, req.url)
          );
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Match dashboard routes and API routes (except auth)
    "/dashboard/:path*",
    "/((?!auth|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
