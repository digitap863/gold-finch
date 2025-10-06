import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Order from "@/models/order";
import { verifyToken } from "@/helpers/verifyToken";


export async function GET(req: NextRequest) {
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
    
    // Get order statistics for this salesman
    const totalOrders = await Order.countDocuments({ salesmanId: user.userId });
    
    // Count orders by status
    const pendingOrders = await Order.countDocuments({ 
      salesmanId: user.userId,
      status: { $in: ['confirmed', 'order_view_and_accepted', 'cad_completed', 'production_floor'] }
    });
    
    const deliveredOrders = await Order.countDocuments({ 
      salesmanId: user.userId,
      status: 'dispatched'
    });
    
    const cancelledOrders = await Order.countDocuments({ 
      salesmanId: user.userId,
      status: 'cancelled'
    });
    
    const finishedOrders = await Order.countDocuments({ 
      salesmanId: user.userId,
      status: 'finished'
    });

    // Get recent orders (last 5)
    const recentOrders = await Order.find({ salesmanId: user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderCode productName customerName status createdAt')
      .populate("catalogId", "title");

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        finishedOrders
      },
      recentOrders
    });

  } catch (error) {
    console.error("Error fetching order statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch order statistics" },
      { status: 500 }
    );
  }
}

