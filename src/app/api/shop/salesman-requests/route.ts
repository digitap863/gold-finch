import { NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function GET() {
  await connect();
  // Return all pending salesman requests (users with role 'salesman' and requestStatus 'pending')
  const requests = await User.find({ role: "salesman", requestStatus: "pending" }, { name: 1, mobile: 1, email: 1, requestStatus: 1, shop: 1 }).sort({ createdAt: -1 });
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  await connect();
  try {
    const data = await req.json();
    // Optionally: check for existing user with same mobile/email
    const existing = await User.findOne({ $or: [{ mobile: data.mobile }, { email: data.email }] });
    if (existing) {
      return NextResponse.json({ error: "User with this mobile or email already exists." }, { status: 400 });
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(data.password, 10);
    // Create a new salesman user request
    const user = await User.create({
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      shop: data.shop,
      password: hashedPassword,
      role: "salesman",
      isVerified: false,
      requestStatus: "pending",
    });
    return NextResponse.json({ success: true, id: user._id });
  } catch (e) {
    console.log(e, "error")
    // Always return a JSON error
    return NextResponse.json({ error: "Failed to create salesman request." }, { status: 500 });
  }
} 