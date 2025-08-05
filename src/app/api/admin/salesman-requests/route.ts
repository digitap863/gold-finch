import { NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function GET() {
  try {
    await connect();

    // Fetch all salesman requests (users with role "salesman" and pending status)
    const salesmanRequests = await User.find({ 
      role: "salesman",
      requestStatus: "pending"
    }).sort({ createdAt: -1 });

    return NextResponse.json(salesmanRequests);
  } catch (error) {
    console.error("Error fetching salesman requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch salesman requests" },
      { status: 500 }
    );
  }
} 