import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Catalog from "@/models/catalog";
import { uploadFile } from "@/helpers/fileUpload";

export async function POST(req: NextRequest) {
  try {
    await connect();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const style = formData.get("style") as string;
    const size = formData.get("size") as string;
    const weight = parseFloat(formData.get("weight") as string);
    const font = formData.get("font") as string;
    const description = formData.get("description") as string;
    const files = formData.getAll("images") as File[];

    // Validate required fields
    if (!title || !style || !size || !weight || !font || files.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Separate images and STL files
    const imageFiles: File[] = [];
    const stlFiles: File[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isSTL = file.name.toLowerCase().endsWith('.stl');
      
      if (isImage) {
        imageFiles.push(file);
      } else if (isSTL) {
        stlFiles.push(file);
      }
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    for (const image of imageFiles) {
      try {
        const imageUrl = await uploadFile(image);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
          { error: "Failed to upload one or more images" },
          { status: 500 }
        );
      }
    }

    // Upload STL files to Cloudinary
    const stlUrls: string[] = [];
    for (const stlFile of stlFiles) {
      try {
        const stlUrl = await uploadFile(stlFile);
        stlUrls.push(stlUrl);
      } catch (error) {
        console.error("Error uploading STL file:", error);
        return NextResponse.json(
          { error: "Failed to upload one or more STL files" },
          { status: 500 }
        );
      }
    }

    // Create catalog in database
    const catalog = new Catalog({
      title,
      style,
      size,
      weight,
      font,
      description: description || "",
      images: imageUrls,
      files: stlUrls, // Store STL file URLs separately
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

export async function GET() {
  try {
    await connect();

    const catalogs = await Catalog.find({}).sort({ createdAt: -1 });

    return NextResponse.json(catalogs);
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalogs" },
      { status: 500 }
    );
  }
} 