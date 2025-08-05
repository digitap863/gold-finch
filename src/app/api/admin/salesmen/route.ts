import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await connect();

    // Fetch all approved salesmen (users with role "salesman" and isApproved: true)
    const salesmen = await User.find({ 
      role: "salesman", 
      isApproved: true 
    }).sort({ createdAt: -1 });

    return NextResponse.json(salesmen);
  } catch (error) {
    console.error("Error fetching salesmen:", error);
    return NextResponse.json(
      { error: "Failed to fetch salesmen" },
      { status: 500 }
    );
  }
} 