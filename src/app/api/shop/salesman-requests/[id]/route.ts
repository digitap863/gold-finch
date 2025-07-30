import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  const { action } = await req.json();
  const user = await User.findById(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (action === "approve") {
    user.requestStatus = "approved";
    user.isVerified = true;
  } else if (action === "reject") {
    user.requestStatus = "rejected";
    user.isVerified = false;
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  await user.save();
  return NextResponse.json({ success: true, user });
} 