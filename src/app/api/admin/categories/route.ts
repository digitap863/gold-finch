import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Catagory from "@/models/catagory";

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    const name: string | undefined = body?.name;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Always generate slug from name to ensure consistency
    const slug = toSlug(name);

    const existing = await Catagory.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    const category = await Catagory.create({ name, slug });
    return NextResponse.json({ message: "Category created", category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connect();
    const categories = await Catagory.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
 