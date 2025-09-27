import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { isBlocked } = await req.json();
    const { id: userId } = await params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Salesman status updated successfully",
      salesman: updatedUser
    });
  } catch (error) {
    console.error("Error updating salesman status:", error);
    return NextResponse.json(
      { error: "Failed to update salesman status" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await params;
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 