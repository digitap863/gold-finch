import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Order from "@/models/order";
import Counter from "@/models/Counter";
import Catalog from "@/models/catalog";
import User from "@/models/user";
import { uploadFile } from "@/helpers/fileUpload";
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
  } catch (error) {
    return null;
  }
};

export async function POST(req: NextRequest) {
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
    
    const formData = await req.formData();
    
    const productName = formData.get("productName") as string;
    const customerName = formData.get("customerName") as string;
    const customizationDetails = formData.get("customizationDetails") as string;
    const expectedDeliveryDate = formData.get("expectedDeliveryDate") as string;
    const catalogId = formData.get("catalogId") as string;
    const priority = formData.get("priority") as string || "medium";

    // Validation
    if (!productName || !customerName) {
      return NextResponse.json(
        { error: "Product name and customer name are required" },
        { status: 400 }
      );
    }

    // Handle voice recording upload
    const voiceRecordingFile = formData.get("voiceRecording") as File;
    let voiceRecordingUrl = "";
    if (voiceRecordingFile && voiceRecordingFile.size > 0) {
      try {
        voiceRecordingUrl = await uploadFile(voiceRecordingFile);
      } catch (error) {
        console.error("Error uploading voice recording:", error);
        return NextResponse.json(
          { error: "Failed to upload voice recording" },
          { status: 500 }
        );
      }
    }

    // Handle image uploads
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [];
    
    for (const file of imageFiles) {
      if (file.size > 0) {
        try {
          const imageUrl = await uploadFile(file);
          imageUrls.push(imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
          );
        }
      }
    }

    // Generate orderCode: ORD-YYYYMMDD-#####
    const today = new Date();
    const yyyymmdd = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    const counter = await Counter.findOneAndUpdate(
      { name: `order-${yyyymmdd}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderCode = `ORD-${yyyymmdd}-${String(counter.seq).padStart(5,'0')}`;

    // Create order
    const order = new Order({
      orderCode,
      productName,
      customerName,
      customizationDetails,
      voiceRecording: voiceRecordingUrl || undefined,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      catalogId: catalogId || undefined,
      salesmanId: user.userId,
      priority
    });

    await order.save();

    return NextResponse.json({
      message: "Order created successfully",
      order
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

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
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query - only show orders for this salesman
    const query: Record<string, unknown> = { salesmanId: user.userId };
    if (status && status !== "all") {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("catalogId", "title images");

    // Get total count
    const total = await Order.countDocuments(query);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 