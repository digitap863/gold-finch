import { connect } from "@/db.Config/db.Config";
import { createOrderStatusNotification } from "@/helpers/createNotification";
import { withAdminAuth } from "@/lib/api/withAdminAuth";
import Order from "@/models/order";
import { NextRequest, NextResponse } from "next/server";

// Ensure models are registered
import "@/models/catagory";
import "@/models/catalog";
import "@/models/font";
import "@/models/user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { id } = await params;
    const order = await Order.findOne({ orderCode: id })
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
    const { id: orderCode } = await params;
    const body = await req.json();

    // Get current order to check for status changes
    const currentOrder = await Order.findOne({ orderCode });
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowed: string[] = ["status", "priority", "expectedDeliveryDate", "cancelReason"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        update[key] = body[key];
      }
    }

    // If status is being set to cancelled, ensure cancelReason is provided
    if (update.status === 'cancelled' && !update.cancelReason) {
      return NextResponse.json({ error: "Cancel reason is required when cancelling an order" }, { status: 400 });
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const order = await Order.findOneAndUpdate(
      { orderCode },
      update,
      { new: true }
    )
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
          order.customerName,
          update.cancelReason as string
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { id } = await params;
    
    // Try to find by orderCode first, then by _id
    let order = await Order.findOne({ orderCode: id });
    
    if (!order) {
      // Try to find by MongoDB _id
      order = await Order.findById(id);
    }
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await Order.findByIdAndDelete(order._id);

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

