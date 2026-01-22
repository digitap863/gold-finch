import mongoose from "mongoose";

const catalogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  style: { type: String, required: true },
  width: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false },
  material: { type: String, required: true, enum: ["Gold", "Diamond"] },
  audience: { type: String, required: true, enum: ['Men', 'Women', 'Kids', 'All'] },
  images: { type: [String], required: true },
  files: { type: [String], required: false }, // For STL and other 3D files
  size: { type: String, required: false },
  weight: { type: Number, required: false },
  font: { type: mongoose.Schema.Types.ObjectId, ref: "Font", required: false },
  fonts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Font" }],
  description: { type: String, required: false },
}, {
  timestamps: true
});

const Catalog = mongoose.models.Catalog || mongoose.model("Catalog", catalogSchema);

export default Catalog;