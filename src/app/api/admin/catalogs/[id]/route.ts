import { connect } from "@/db.Config/db.Config";
import { uploadFile } from "@/helpers/fileUpload";
import Catalog from "@/models/catalog";
import { NextRequest, NextResponse } from "next/server";

async function extractId(context: unknown, req: NextRequest): Promise<string | null> {
  if (context && typeof context === "object" && "params" in context) {
    const params = await (context as { params?: Promise<Record<string, string>> }).params;
    const id = params?.id;
    if (typeof id === "string") return id;
  }
  const parts = req.nextUrl.pathname.split("/");
  return parts[parts.length - 1] || null;
}

export async function GET(
  req: NextRequest,
  context: unknown
) {
  try {
    await connect();
    
    const catalogId = await extractId(context, req);
    
    const catalog = await Catalog.findById(catalogId).populate("font").populate("fonts");
    
    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: unknown
) {
  try {
    await connect();
    
    const catalogId = await extractId(context, req);
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const style = formData.get("style") as string;
    const size = formData.get("size") as string;
    const weight = parseFloat(formData.get("weight") as string);
    const width = formData.get("width") as string;
    const length = formData.get("length") as string;
    const category = formData.get("category") as string;
    const font = formData.get("font") as string;
    const description = formData.get("description") as string;
    
    // Validation
    if (!title || !style) {
      return NextResponse.json(
        { error: "Title and style are required" },
        { status: 400 }
      );
    }
    
    // Get existing catalog
    const existingCatalog = await Catalog.findById(catalogId);
    if (!existingCatalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      );
    }
    
    // Handle new files
    const newFiles = formData.getAll("images") as File[];
    const existingImages = formData.getAll("existingImages") as string[];
    const existingFiles = formData.getAll("existingFiles") as string[];
    const removedImages = formData.getAll("removedImages") as string[];
    const removedFiles = formData.getAll("removedFiles") as string[];
    
    // Upload new files
    const newImageUrls: string[] = [];
    const newFileUrls: string[] = [];
    
    for (const file of newFiles) {
      try {
        const isImage = file.type.startsWith('image/');
        const isSTL = file.name.toLowerCase().endsWith('.stl');
        
        if (isImage) {
          const imageUrl = await uploadFile(file);
          newImageUrls.push(imageUrl);
        } else if (isSTL) {
          const fileUrl = await uploadFile(file);
          newFileUrls.push(fileUrl);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        );
      }
    }
    
    // Combine existing and new files, remove deleted ones
    const finalImages = [...existingImages, ...newImageUrls].filter(
      img => !removedImages.includes(img)
    );
    const finalFiles = [...existingFiles, ...newFileUrls].filter(
      file => !removedFiles.includes(file)
    );
    
    // Update catalog
    const updatedCatalog = await Catalog.findByIdAndUpdate(
      catalogId,
      {
        title,
        style,
        size,
        weight: weight || undefined,
        width: width ? parseFloat(width) : undefined,
        length: length ? parseFloat(length) : undefined,
        category: category || undefined,
        font: font || undefined,
        fonts: font ? [font] : undefined,
        description,
        images: finalImages,
        files: finalFiles,
      },
      { new: true }
    );
    
    return NextResponse.json(updatedCatalog);
  } catch (error) {
    console.error("Error updating catalog:", error);
    return NextResponse.json(
      { error: "Failed to update catalog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: unknown
) {
  try {
    await connect();
    
    const catalogId = await extractId(context, req);
    
    // Find and delete the catalog
    const deletedCatalog = await Catalog.findByIdAndDelete(catalogId);
    
    if (!deletedCatalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Catalog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting catalog:", error);
    return NextResponse.json(
      { error: "Failed to delete catalog" },
      { status: 500 }
    );
  }
} 