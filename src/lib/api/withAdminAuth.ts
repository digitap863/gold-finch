import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export function withAdminAuth(handler: (req: NextRequest, context: any, user: any) => Promise<Response>) {
  return async (req: NextRequest, context: any) => {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret);
      if (payload.role === "admin" && payload.isVerified) {
        return handler(req, context, payload);
      }
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  };
} 