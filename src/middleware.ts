import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const roleDashboard = {
  admin: "/admin",
  salesman: "/salesman",
};

type UserRole = keyof typeof roleDashboard;

function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && ["admin", "salesman"].includes(role);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  if (["/admin", "/salesman"].some((p) => path.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      // Use jose for JWT verification
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role;
      const isVerified = payload.isVerified;
      if (!isVerified) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (!userRole || !isUserRole(userRole)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (!path.startsWith(roleDashboard[userRole as UserRole])) {
        return NextResponse.redirect(new URL(roleDashboard[userRole as UserRole] || "/", request.url));
      }
      return NextResponse.next();
    } catch (e) {
      console.log(e, "error")
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/salesman", "/salesman/:path*"],
};