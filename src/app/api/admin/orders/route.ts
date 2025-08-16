import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import { withAdminAuth } from "@/lib/api/withAdminAuth";
import Order from "@/models/order";

export async function GET(req: NextRequest) {
  await connect();

  // Ensure all models are loaded for proper population
  await import("@/models/catalog");
  await import("@/models/user");
  await import("@/models/order");
  
  // Admin auth
  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "confirmed"; // default to new incoming orders
    const q = searchParams.get("q");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") === "asc" ? 1 : -1;

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;

    if (q && q.trim().length > 0) {
      const text = new RegExp(q.trim(), "i");
      query.$or = [
        { productName: text },
        { customerName: text },
        { orderCode: text },
      ];
    }

    // Date filtering
    if (dateFrom || dateTo) {
      const dateQuery: Record<string, Date> = {};
      if (dateFrom) {
        // Start of the day for dateFrom
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        dateQuery.$gte = fromDate;
      }
      if (dateTo) {
        // End of the day for dateTo
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateQuery.$lte = toDate;
      }
      query.createdAt = dateQuery;
    }

    const orders = await Order.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate("catalogId", "title")
      .populate("salesmanId", "name email mobile");

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}


