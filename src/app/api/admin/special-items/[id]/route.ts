import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import SpecialItem from "@/models/special_item";
import { uploadFile } from "@/helpers/fileUpload";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const form = await req.formData();
    const name = form.get("name") as string | null;
    const weightRaw = form.get("weight") as string | null;
    const imageFile = form.get("image") as File | null;

    const update: Record<string, unknown> = {};
    if (name) update.name = name;
    if (weightRaw) {
      const weight = parseFloat(weightRaw);
      if (Number.isNaN(weight)) {
        return NextResponse.json({ error: "Weight must be a number" }, { status: 400 });
      }
      update.weight = weight;
    }
    if (imageFile && imageFile.size > 0) {
      update.image = await uploadFile(imageFile);
    }

    const { id } = await params;
    const item = await SpecialItem.findByIdAndUpdate(id, update, { new: true });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const { id } = await params;
    await SpecialItem.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}


