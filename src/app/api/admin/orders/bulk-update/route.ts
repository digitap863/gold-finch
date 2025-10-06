import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Order from "@/models/order";
import { withAdminAuth } from "@/lib/api/withAdminAuth";
import { createOrderStatusNotification } from "@/helpers/createNotification";

// Ensure models are registered
import "@/models/catalog";
import "@/models/user";
import "@/models/catagory";

export async function PUT(req: NextRequest) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { ids, status, cancelReason } = await req.json();
    if (!Array.isArray(ids) || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // If status is being set to cancelled, ensure cancelReason is provided
    if (status === 'cancelled' && !cancelReason) {
      return NextResponse.json({ error: "Cancel reason is required when cancelling orders" }, { status: 400 });
    }

    // First, get the current orders to track status changes
    const currentOrders = await Order.find({ _id: { $in: ids } })
      .populate("salesmanId", "_id");

    const updateData: { status: string; cancelReason?: string } = { status };
    if (cancelReason) {
      updateData.cancelReason = cancelReason;
    }

    // Update the orders
    await Order.updateMany({ _id: { $in: ids } }, { $set: updateData });

    // Create notifications for each order that had a status change
    for (const order of currentOrders) {
      if (order.status !== status && order.salesmanId) {
        try {
          await createOrderStatusNotification(
            order._id.toString(),
            order.orderCode,
            order.salesmanId._id.toString(),
            order.status,
            status,
            order.customerName,
            cancelReason
          );
        } catch (notificationError) {
          console.error("Error creating notification for order:", order._id, notificationError);
          // Don't fail the bulk update if notification creation fails
        }
      }
    }

    return NextResponse.json({ message: "Orders updated" });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to update orders" }, { status: 500 });
  }
}


