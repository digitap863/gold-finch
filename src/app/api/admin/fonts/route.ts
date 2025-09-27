import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { connect } from "@/db.Config/db.Config";
import Font from "@/models/font";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const files = formData.getAll("files") as File[];

    if (!name || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Name and at least one font file are required" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "fonts");
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }   

    const savedFilePaths: string[] = [];

    // Save each file
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);
      
      await writeFile(filePath, buffer);
      savedFilePaths.push(`/uploads/fonts/${fileName}`);
    }

    // Create font document in database
    const font = new Font({
      name,
      files: savedFilePaths,
    });

    await font.save();

    return NextResponse.json(
      { 
        message: "Font created successfully", 
        font: {
          id: font._id,
          name: font.name,
          files: font.files,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating font:", error);
    return NextResponse.json(
      { error: "Failed to create font" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();

    const fonts = await Font.find({});
    
    return NextResponse.json({ fonts });
  } catch (error) {
    console.error("Error fetching fonts:", error);
    return NextResponse.json(
      { error: "Failed to fetch fonts" },
      { status: 500 }
    );
  }
} 

export async function DELETE(request: NextRequest) {
  try {
    await connect();
    let fontId = null;
    // Try to get id from query string first
    const { searchParams } = new URL(request.url);
    fontId = searchParams.get("id");
    // If not in query, try to get from JSON body
    if (!fontId) {
      try {
        const body = await request.json();
        fontId = body.id;
      } catch {}
    }
    if (!fontId) {
      return NextResponse.json({ error: "Font ID is required" }, { status: 400 });
    }
    const font = await Font.findById(fontId);
    if (!font) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 });
    }
    // Remove files from disk
    if (font.files && Array.isArray(font.files)) {
      for (const filePath of font.files) {
        try {
          const absPath = join(process.cwd(), "public", ...filePath.split("/uploads/")[1].split("/").filter(Boolean).reduce((acc: string[], cur: string) => { acc.push(cur); return acc; }, ["uploads"]));
          if (existsSync(absPath)) {
            require("fs").unlinkSync(absPath);
          }
        } catch (e) {
          // Ignore file delete errors
          
        }
      }
    }
    await Font.findByIdAndDelete(fontId);
    return NextResponse.json({ message: "Font deleted successfully" });
  } catch (error) {
    console.error("Error deleting font:", error);
    return NextResponse.json({ error: "Failed to delete font" }, { status: 500 });
  }
} 