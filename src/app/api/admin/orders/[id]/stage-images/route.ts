import { connect } from "@/db.Config/db.Config";
import { uploadFile } from "@/helpers/fileUpload";
import { withAdminAuth } from "@/lib/api/withAdminAuth";
import Order from "@/models/order";
import { NextRequest, NextResponse } from "next/server";

const VALID_STAGES = ["cad_completed", "production_floor", "finished"];

// POST: Upload images for a specific stage
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { id: orderCode } = await params;
    const formData = await req.formData();
    const stage = formData.get("stage") as string;
    const images = formData.getAll("images") as File[];

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: "Invalid stage. Must be one of: cad_completed, production_floor, finished" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Find order
    const order = await Order.findOne({ orderCode });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Upload images to S3
    const uploadedUrls: string[] = [];
    for (const image of images) {
      if (image instanceof File && image.size > 0) {
        try {
          const url = await uploadFile(image);
          uploadedUrls.push(url);
        } catch (err) {
          console.error("Error uploading stage image:", err);
        }
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "Failed to upload images" },
        { status: 500 }
      );
    }

    // Initialize stageImages if it doesn't exist
    if (!order.stageImages) {
      order.stageImages = {
        cad_completed: [],
        production_floor: [],
        finished: [],
      };
    }

    // Add new images to the stage
    const existingStageImages = order.stageImages[stage] || [];
    order.stageImages[stage] = [...existingStageImages, ...uploadedUrls];

    await order.save();

    return NextResponse.json({
      message: "Images uploaded successfully",
      stageImages: order.stageImages,
      uploadedCount: uploadedUrls.length,
    });
  } catch (error) {
    console.error("Error uploading stage images:", error);
    return NextResponse.json(
      { error: "Failed to upload stage images" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a specific image from a stage
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();

  const authResult = await withAdminAuth(req);
  if (authResult) return authResult;

  try {
    const { id: orderCode } = await params;
    const { stage, imageUrl } = await req.json();

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: "Invalid stage" },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ orderCode });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.stageImages || !order.stageImages[stage]) {
      return NextResponse.json({ error: "No images found for this stage" }, { status: 404 });
    }

    // Remove the image from the stage
    order.stageImages[stage] = order.stageImages[stage].filter(
      (url: string) => url !== imageUrl
    );

    await order.save();

    return NextResponse.json({
      message: "Image removed successfully",
      stageImages: order.stageImages,
    });
  } catch (error) {
    console.error("Error removing stage image:", error);
    return NextResponse.json(
      { error: "Failed to remove stage image" },
      { status: 500 }
    );
  }
}
