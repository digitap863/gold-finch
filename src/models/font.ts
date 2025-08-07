import mongoose from "mongoose";

const fontSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: { type: [String], required: true },
});

const Font = mongoose.models.Font || mongoose.model("Font", fontSchema);

export default Font;