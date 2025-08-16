import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Order from "@/models/order";
import Catalog from "@/models/catalog";
import User from "@/models/user";
import { withAdminAuth } from "@/lib/api/withAdminAuth";
import { createOrderStatusNotification } from "@/helpers/createNotification";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { id } = await params;
    const order = await Order.findById(id)
      .populate({
        path: "catalogId",
        select: "title images description style size weight files font",
        populate: {
          path: "font",
          select: "name files"
        }
      })
      .populate("salesmanId", "name email mobile shopName shopAddress shopMobile");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { id: orderId } = await params;
    const body = await req.json();

    // Get current order to check for status changes
    const currentOrder = await Order.findById(orderId);
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowed: string[] = ["status", "priority", "expectedDeliveryDate"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        update[key] = body[key];
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true })
      .populate("catalogId", "title")
      .populate("salesmanId", "name email mobile shopName shopAddress shopMobile");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create notification if status changed
    if (update.status && update.status !== currentOrder.status && order.salesmanId) {
      try {
        await createOrderStatusNotification(
          order._id.toString(),
          order.orderCode,
          order.salesmanId._id.toString(),
          currentOrder.status,
          update.status as string,
          order.customerName
        );
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't fail the order update if notification creation fails
      }
    }

    return NextResponse.json({ message: "Order updated", order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}


