import { NextRequest, NextResponse } from "next/server";
import Shop from "@/models/shop";
import User from "@/models/user";
import { connect } from "@/db.Config/db.Config";
import { withAdminAuth } from "@/lib/api/withAdminAuth";

export const GET = withAdminAuth(async (req, { params }, user) => {
  await connect();
  const shop = await Shop.findById(params.id)
    .populate({
      path: "ownerId",
      select: "name email mobile requestStatus isVerified"
    });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  return NextResponse.json({ shop });
});

export const PATCH = withAdminAuth(async (req, { params }, user) => {
  await connect();
  const { action } = await req.json();
  const shop = await Shop.findById(params.id);
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  const owner = await User.findOne({ shop: shop._id });
  if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 404 });

  if (action === "approve") {
    shop.isVerified = true;
    owner.requestStatus = "approved";
    owner.isVerified = true;
  } else if (action === "reject") {
    shop.isVerified = false;
    owner.requestStatus = "rejected";
    owner.isVerified = false;
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  await shop.save();
  await owner.save();
  return NextResponse.json({ shop });
}); 