import { connect } from "@/db.Config/db.Config";
import Notification from "@/models/notification";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

// Salesman Notifications API
// This endpoint is exclusively for salesman dashboard notifications
// Admins do not have access to this notification system

// Helper function to verify JWT token (same as middleware)
async function verifyJWTToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  await connect();

  try {
    // Verify JWT token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const payload = await verifyJWTToken(token);
    if (!payload || payload.role !== "salesman" || !payload.isApproved || payload.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const isRead = searchParams.get("isRead");
    const type = searchParams.get("type");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {
      userId: payload.userId,
      userType: "salesman"
    };

    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    if (type && type !== "all") {
      query.type = type;
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("orderId", "orderCode productName customerName status");

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: payload.userId,
      userType: "salesman",
      isRead: false
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connect();

  try {
    // Verify JWT token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const payload = await verifyJWTToken(token);
    if (!payload || payload.role !== "salesman" || !payload.isApproved || payload.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, notificationIds } = body;

    if (action === "markAsRead") {
      const result = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          userId: payload.userId,
          userType: "salesman"
        },
        { isRead: true }
      );

      return NextResponse.json({
        message: "Notifications marked as read",
        modifiedCount: result.modifiedCount
      });
    }

    if (action === "markAllAsRead") {
      const result = await Notification.updateMany(
        {
          userId: payload.userId,
          userType: "salesman",
          isRead: false
        },
        { isRead: true }
      );

      return NextResponse.json({
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
