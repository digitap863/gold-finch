import { NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Shop from "@/models/shop";

export async function GET() {
  await connect();
  // Return _id, shopName, and gstNumber (as code fallback)
  const shops = await Shop.find({}, { shopName: 1, _id: 1, gstNumber: 1 }).sort({ shopName: 1 });
  return NextResponse.json(shops);
} 