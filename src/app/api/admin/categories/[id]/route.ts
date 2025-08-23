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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const category = await Catagory.findById(params.id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const body = await request.json();
    const name: string | undefined = body?.name;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Always generate slug from name for consistency
    const slug = toSlug(name);

    const existing = await Catagory.findOne({
      $or: [{ name }, { slug }],
      _id: { $ne: params.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Category with same name or slug exists" }, { status: 409 });
    }

    const category = await Catagory.findByIdAndUpdate(
      params.id,
      { name, slug },
      { new: true }
    );
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Category updated", category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connect();
    const category = await Catagory.findByIdAndDelete(params.id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
 