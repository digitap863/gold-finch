import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Salesman from "@/models/salesman";
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

    // Update salesman status
    const updatedSalesman = await Salesman.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSalesman) {
      return NextResponse.json(
        { error: "Salesman request not found" },
        { status: 404 }
      );
    }

    // Update corresponding user status
    const user = await User.findOne({ 
      mobile: updatedSalesman.mobile,
      role: "salesman" 
    });

    if (user) {
      await User.findByIdAndUpdate(user._id, {
        requestStatus: status,
        isVerified: status === "approved"
      });
    }

    return NextResponse.json({
      success: true,
      message: `Salesman request ${status} successfully`,
      data: updatedSalesman
    });
  } catch (error) {
    console.error("Error updating salesman request:", error);
    return NextResponse.json(
      { error: "Failed to update salesman request" },
      { status: 500 }
    );
  }
} 