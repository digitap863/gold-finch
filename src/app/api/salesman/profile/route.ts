import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import { jwtVerify } from "jose";

async function getCurrentSalesman(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role === "salesman") {
      return payload.userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  await connect();
  const userId = await getCurrentSalesman(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await User.findById(userId).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      isVerified: user.isVerified,
    }
  });
}

export async function PATCH(req: NextRequest) {
  await connect();
  const userId = await getCurrentSalesman(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, mobile } = await req.json();
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update user details
  if (name) user.name = name;
  if (email) user.email = email;
  if (mobile) user.mobile = mobile;
  
  await user.save();
  return NextResponse.json({ success: true });
} 