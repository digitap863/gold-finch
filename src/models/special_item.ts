import mongoose from "mongoose";

const specialItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  weight: { type: Number, required: true },
});

const SpecialItem = mongoose.models.SpecialItem || mongoose.model("SpecialItem", specialItemSchema);

export default SpecialItem;