import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connect();

    const { status } = await req.json();
    const { id } = params;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // Update user status directly
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        requestStatus: status,
        isApproved: status === "approved"
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Salesman request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Salesman request ${status} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating salesman request:", error);
    return NextResponse.json(
      { error: "Failed to update salesman request" },
      { status: 500 }
    );
  }
} 