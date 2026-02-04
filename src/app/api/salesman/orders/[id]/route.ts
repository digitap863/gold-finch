import { connect } from "@/db.Config/db.Config";
import { sendOrderEditNotification } from "@/lib/telegram";
import Order from "@/models/order";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Helper function to verify JWT token
const verifyToken = (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
      isApproved: boolean;
      isBlocked: boolean;
    };
    
    return decoded;
  } catch {
    return null;
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
    // Verify JWT token
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is a salesman and approved
    if (user.role !== "salesman" || !user.isApproved) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const { id: orderId } = await params;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      salesmanId: user.userId 
    }).populate("catalogId", "title images description");
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
    // Verify JWT token
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is a salesman and approved
    if (user.role !== "salesman" || !user.isApproved) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const { id: orderId } = await params;
    
    // First, fetch the order to check the 48-hour window
    const existingOrder = await Order.findOne({ 
      _id: orderId, 
      salesmanId: user.userId 
    });
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if order is within 48-hour edit window
    const orderCreatedAt = new Date(existingOrder.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) {
      return NextResponse.json(
        { 
          error: "Editing period expired. You can no longer modify this order.",
          editWindowExpired: true 
        },
        { status: 403 }
      );
    }
    
    // Check if order status is still editable (only if status is 'confirmed' or 'order_view_and_accepted')
    const editableStatuses = ['confirmed', 'order_view_and_accepted'];
    if (!editableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        { 
          error: "Order cannot be edited. It has already been processed.",
          orderProcessed: true 
        },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    
    // Only allow updating certain fields
    const allowedUpdates = [
      'productName', 
      'customerName',
      'salesmanPhone',
      'customizationDetails', 
      'expectedDeliveryDate',
      'karatage',
      'weight',
      'colour',
      'name',
      'size',
      'stone',
      'enamel',
      'matte',
      'rodium',
      'additional_feature_color'
    ];
    
    const updateData: Record<string, unknown> = {};
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const order = await Order.findOneAndUpdate(
      { _id: orderId, salesmanId: user.userId },
      updateData,
      { new: true }
    ).populate("catalogId", "title images description");
    
    // Send Telegram notification for order edit (async, don't wait)
    if (order) {
      sendOrderEditNotification(
        existingOrder.orderCode,
        existingOrder.productName
      ).catch(err => {
        console.error('Failed to send Telegram notification:', err);
      });
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    
    // Verify JWT token
    const user = verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is a salesman and approved
    if (user.role !== "salesman" || !user.isApproved) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    const { id: orderId } = await params;
    
    const order = await Order.findOneAndDelete({ 
      _id: orderId, 
      salesmanId: user.userId 
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

