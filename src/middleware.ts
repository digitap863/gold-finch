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

  // Handle root path - redirect authenticated users to their dashboard
  if (path === "/") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);
        const userRole = payload.role;
        const isApproved = payload.isApproved;
        const isBlocked = payload.isBlocked;
        
        // Check if user is blocked
        if (isBlocked) {
          return NextResponse.next(); // Stay on login page if blocked
        }
        
        // Check if user is approved
        if (!isApproved) {
          return NextResponse.next(); // Stay on login page if not approved
        }
        
        if (userRole && isUserRole(userRole)) {
          return NextResponse.redirect(new URL(roleDashboard[userRole as UserRole], request.url));
        }
      } catch (e) {
        console.log(e, "error")
        return NextResponse.next(); // Stay on login page if token is invalid
      }
    }
    return NextResponse.next(); // Allow access to login page
  }

  // Handle protected routes
  if (["/admin", "/salesman"].some((p) => path.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      // Use jose for JWT verification
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role;
      const isApproved = payload.isApproved;
      const isBlocked = payload.isBlocked;
      
      // Check if user is blocked
      if (isBlocked) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      // Check if user is approved (for both admin and salesman)
      if (!isApproved) {
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
  matcher: ["/", "/admin", "/admin/:path*", "/salesman", "/salesman/:path*"],
};