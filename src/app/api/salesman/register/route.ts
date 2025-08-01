import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import Salesman from "@/models/salesman";

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

    // Create new user
    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      role: "salesman",
      isVerified: false,
      requestStatus: "pending",
    });

    // Create new salesman record
    const salesman = await Salesman.create({
      name,
      mobile,
      email,
      shopName,
      shopAddress,
      shopMobile,
      status: "pending",
      // Note: shop field is required in the model but we don't have shop functionality
      // You may need to update the model to make this optional or provide a default value
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Salesman registration successful",
        data: {
          userId: user._id,
          salesmanId: salesman._id
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