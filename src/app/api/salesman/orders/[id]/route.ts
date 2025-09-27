import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Order from "@/models/order";
import Catalog from "@/models/catalog";
import User from "@/models/user";
import jwt from "jsonwebtoken";

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
    const body = await req.json();
    
    // Only allow updating certain fields
    const allowedUpdates = [
      'productName', 
      'customerName', 
      'customizationDetails', 
      'expectedDeliveryDate',
      'priority'
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
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
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

