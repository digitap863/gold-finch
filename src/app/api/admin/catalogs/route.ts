import { connect } from "@/db.Config/db.Config";
import { uploadFile } from "@/helpers/fileUpload";
import Catalog from "@/models/catalog";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const style = formData.get("style") as string;
    const sizeRaw = formData.get("size") as string | null;
    const size = sizeRaw && sizeRaw.length > 0 ? sizeRaw : undefined;
    const widthRaw = formData.get("width") as string | null;
    const width = widthRaw && widthRaw.length > 0 ? parseFloat(widthRaw) : undefined;
    const weightRaw = formData.get("weight") as string | null;
    const weight = weightRaw && weightRaw.length > 0 ? parseFloat(weightRaw) : undefined;
    const font = formData.get("font") as string; // legacy single font
    const fonts = formData.getAll("fonts") as string[]; // new multiple fonts
    const category = formData.get("category") as string | null;
    const material = formData.get("material") as ("Gold" | "Diamond") | null;
    const audience = formData.get("audience") as ("Men" | "Women" | "Kids" | "All") | null;
    const description = formData.get("description") as string;
    const files = formData.getAll("images") as File[];

    // Validate required fields
    if (!title || !style || files.length === 0 || !material || !audience) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upload images to S3
    const imageUrls: string[] = [];
    for (const image of files) {
      try {
        const imageUrl = await uploadFile(image);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
        return NextResponse.json(
          { error: `Failed to upload image "${image.name}": ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    // Create catalog in database
    const catalog = new Catalog({
      title,
      style,
      size,
      width,
      weight,
      font: font || undefined,
      fonts: fonts && fonts.length > 0 ? fonts : undefined,
      category: category || undefined,
      material,
      audience,
      description: description || "",
      images: imageUrls,
    });

    await catalog.save();

    return NextResponse.json(
      { 
        message: "Catalog created successfully", 
        catalog 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating catalog:", error);
    return NextResponse.json(
      { error: "Failed to create catalog" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "0"); // 0 means no limit (fetch all)
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { style: { $regex: search, $options: "i" } },
      ];
    }
    
    if (category && category !== "all") {
      query.category = category;
    }

    // If no pagination requested (limit = 0), return all catalogs (for admin page compatibility)
    if (limit === 0) {
      const catalogs = await Catalog.find(query).sort({ createdAt: -1 });
      return NextResponse.json(catalogs);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const total = await Catalog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Fetch paginated catalogs
    const catalogs = await Catalog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      catalogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalogs" },
      { status: 500 }
    );
  }
}
