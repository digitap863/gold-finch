import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const { 
      name, 
      mobile, 
      email, 
      password, 
      shopName, 
      shopAddress, 
      shopMobile 
    } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or mobile already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new salesman user
    const salesman = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      role: "salesman",
      requestStatus: "pending",
      isApproved: false,
      shopName,
      shopAddress,
      shopMobile,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Salesman registration successful",
        data: {
          userId: salesman._id,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Salesman registration error:", error);
    return NextResponse.json(
      { error: "Failed to register salesman" },
      { status: 500 }
    );
  }
} 