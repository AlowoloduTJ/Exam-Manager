import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateStudentSession } from "@/lib/auth";

// Routes that require authentication
const protectedRoutes = [
  "/student",
  "/exam",
  "/essay",
];

// Routes that should redirect if already authenticated
const authRoutes = [
  "/login",
  "/setup",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Validate session for protected routes
    const session = await validateStudentSession(request);

    if (!session || !session.isValid) {
      // Session invalid or device mismatch - redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "session_invalid");
      return NextResponse.redirect(loginUrl);
    }

    // Session valid - allow request
    return NextResponse.next();
  }

  // For auth routes, check if already logged in
  if (isAuthRoute && pathname === "/login") {
    const session = await validateStudentSession(request);

    if (session && session.isValid) {
      // Already logged in - redirect to dashboard
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
