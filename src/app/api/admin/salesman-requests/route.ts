import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Salesman from "@/models/salesman";

export async function GET(req: NextRequest) {
  try {
    await connect();

    const salesmen = await Salesman.find({}).sort({ createdAt: -1 });

    return NextResponse.json(salesmen);
  } catch (error) {
    console.error("Error fetching salesman requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch salesman requests" },
      { status: 500 }
    );
  }
} 