import { connect } from "@/db.Config/db.Config";
import { uploadFile } from "@/helpers/fileUpload";
import { sendNewOrderNotification } from "@/lib/telegram";
import Catalog from "@/models/catalog";
import Counter from "@/models/Counter";
import Order from "@/models/order";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// Ensure Catalog model is registered for populate
void Catalog;

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
    const salesmanPhone = formData.get("salesmanPhone") as string;
    const customizationDetails = formData.get("customizationDetails") as string;
    const expectedDeliveryDate = formData.get("expectedDeliveryDate") as string;
    const catalogId = formData.get("catalogId") as string;
    const priority = formData.get("priority") as string || "medium";
    
    // New fields
    const karatage = formData.get("karatage") as string;
    const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined;
    const colour = formData.get("colour") as string;
    const name = formData.get("name") as string;
    const sizeType = formData.get("sizeType") as string;
    const sizeValue = formData.get("sizeValue") as string;
    const stone = formData.get("stone") === "true";
    const enamel = formData.get("enamel") === "true";
    const matte = formData.get("matte") === "true";
    const rodium = formData.get("rodium") === "true";
    const additional_feature_color = (formData.get("additional_feature_color") as string)?.trim() || "";
    
    // Debug logging
    console.log("additional_feature_color received:", additional_feature_color);

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
        const errorMessage = error instanceof Error ? error.message : "Failed to upload voice recording";
        return NextResponse.json(
          { error: `Voice recording upload failed: ${errorMessage}` },
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
          const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
          return NextResponse.json(
            { error: `Image upload failed (${file.name}): ${errorMessage}` },
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
      salesmanPhone: salesmanPhone || undefined,
      customizationDetails,
      voiceRecording: voiceRecordingUrl || undefined,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
      catalogId: catalogId || undefined,
      salesmanId: user.userId,
      priority,
      // New fields
      karatage: karatage || undefined,
      weight: weight || undefined,
      colour: colour || undefined,
      name: name || undefined,
      size: sizeType ? { type: sizeType, value: sizeValue || undefined } : undefined,
      stone,
      enamel,
      matte,
      rodium,
      ...(additional_feature_color.length > 0 ? { additional_feature_color } : {})
    });

    await order.save();

    // Send Telegram notification for new order (async, don't wait)
    sendNewOrderNotification(orderCode, productName, customerName).catch(err => {
      console.error('Failed to send Telegram notification:', err);
    });

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
      .populate("catalogId", "title style images");

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