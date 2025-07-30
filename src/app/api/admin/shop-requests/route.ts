import { NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Shop from "@/models/shop";
import { withAdminAuth } from "@/lib/api/withAdminAuth";

export const GET = withAdminAuth(async () => {
  await connect();
  // Get only pending shops (not verified, owner requestStatus: 'pending')
  const shops = await Shop.find({ isVerified: false })
    .populate({
      path: "ownerId",
      match: { requestStatus: "pending" },
      select: "name email mobile requestStatus isVerified"
    })
    .sort({ createdAt: -1 });

  // Filter out shops where ownerId is null (no pending owner)
  const pendingShops = shops.filter((shop: any) => shop.ownerId);

  return NextResponse.json({ shops: pendingShops });
}); 