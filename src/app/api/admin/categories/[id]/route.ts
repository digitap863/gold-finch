import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import Catagory from "@/models/catagory";

function extractId(context: unknown, req: NextRequest): string | null {
  if (context && typeof context === "object" && "params" in context) {
    const params = (context as { params?: Record<string, string> }).params;
    const id = params?.id;
    if (typeof id === "string") return id;
  }
  const parts = req.nextUrl.pathname.split("/");
  return parts[parts.length - 1] || null;
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(_req: NextRequest, context: unknown) {
  try {
    await connect();
    const id = extractId(context, _req);
    const category = await Catagory.findById(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: unknown) {
  try {
    await connect();
    const body = await request.json();
    const name: string | undefined = body?.name;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Always generate slug from name for consistency
    const slug = toSlug(name);

    const id = extractId(context, request);
    const existing = await Catagory.findOne({
      $or: [{ name }, { slug }],
      _id: { $ne: id },
    });
    if (existing) {
      return NextResponse.json({ error: "Category with same name or slug exists" }, { status: 409 });
    }

    const category = await Catagory.findByIdAndUpdate(
      id,
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

export async function DELETE(_request: NextRequest, context: unknown) {
  try {
    await connect();
    const id = extractId(context, _request);
    const category = await Catagory.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
 