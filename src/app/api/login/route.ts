import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  await connect();
  const { identifier, password } = await req.json();

  // Determine if identifier is email or mobile
  let user;
  if (identifier.includes("@")) {
    user = await User.findOne({ email: identifier });
  } else {
    user = await User.findOne({ mobile: identifier });
  }
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create JWT
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  // Set token as HTTP-only cookie
  const response = NextResponse.json({
    message: "Login successful",
    user: { role: user.role, isVerified: user.isVerified },
  });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
} 