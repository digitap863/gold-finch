import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import Shop from "@/models/shop";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await connect();

  try {
    const data = await req.json();
    const {
      name,
      mobile,
      email,
      password,
      shopName,
      gstNumber,
      address,
      city,
      state,
      pincode,
    } = data;

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email or mobile already exists." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (role: shop)
    const user = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      role: "shop",
      isVerified: false,
      requestStatus: "pending",
    });

    // Create shop
    const shop = await Shop.create({
      shopName,
      ownerId: user._id,
      address: `${address}, ${city}, ${state} - ${pincode}`,
      gstNumber,
      isVerified: false,
      isActive: true,
    });

    // Link shop to user
    user.shop = shop._id;
    await user.save();

    return NextResponse.json({ message: "Registration successful. Awaiting approval.", userId: user._id, shopId: shop._id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
