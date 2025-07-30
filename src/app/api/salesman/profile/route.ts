import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import Shop from "@/models/shop";
import { jwtVerify } from "jose";

async function getCurrentSalesman(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    if (payload.role === "salesman") {
      return payload.userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  await connect();
  const userId = await getCurrentSalesman(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await User.findById(userId).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let shopName = "";
  if (user.shop) {
    const shop = await Shop.findById(user.shop).lean();
    shopName = shop?.shopName || "";
  }

  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      shopName,
      isVerified: user.isVerified,
    }
  });
}

export async function PATCH(req: NextRequest) {
  await connect();
  const userId = await getCurrentSalesman(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shopName } = await req.json();
  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.shop) {
    const shop = await Shop.findById(user.shop);
    if (shop) {
      shop.shopName = shopName;
      await shop.save();
    }
  }
  return NextResponse.json({ success: true });
} 