import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Order from "@/models/order";
import Catalog from "@/models/catalog";
import User from "@/models/user";
import { withAdminAuth } from "@/lib/api/withAdminAuth";

export async function PUT(req: NextRequest) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { ids, status } = await req.json();
    if (!Array.isArray(ids) || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    await Order.updateMany({ _id: { $in: ids } }, { $set: { status } });
    return NextResponse.json({ message: "Orders updated" });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to update orders" }, { status: 500 });
  }
}


