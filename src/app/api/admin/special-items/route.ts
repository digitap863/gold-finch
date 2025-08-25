import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import SpecialItem from "@/models/special_item";
import { uploadFile } from "@/helpers/fileUpload";

export async function GET() {
  try {
    await connect();
    const items = await SpecialItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connect();
    const form = await req.formData();
    const name = form.get("name") as string;
    const weightRaw = form.get("weight") as string;
    const imageFile = form.get("image") as File | null;

    if (!name || !weightRaw || !imageFile) {
      return NextResponse.json({ error: "Name, weight and image are required" }, { status: 400 });
    }

    const weight = parseFloat(weightRaw);
    if (Number.isNaN(weight)) {
      return NextResponse.json({ error: "Weight must be a number" }, { status: 400 });
    }

    const image = await uploadFile(imageFile);

    const item = await SpecialItem.create({ name, weight, image });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}


