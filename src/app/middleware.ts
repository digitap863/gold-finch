import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value || "";

  if (path === "/admin") {
    if (token) {
      // If token exists, allow access to all admin routes
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.nextUrl)
      );
    } else {
      // If no token, redirect to login
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }
  // Check if the path starts with /admin
  if (path.startsWith("/admin")) {
    if (token) {
      // If token exists, allow access to all admin routes
      return NextResponse.next();
    } else {
      // If no token, redirect to login
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }

  // Handle /login path
  if (path === "/login") {
    if (token) {
      // If token exists, redirect to admin dashboard
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.nextUrl)
      );
    } else {
      // If no token, allow access to login page
      return NextResponse.next();
    }
  }

  // For all other paths, allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/admin", "/login", "/admin/:path*"],
};