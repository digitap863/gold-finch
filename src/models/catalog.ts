import mongoose from "mongoose";

const catalogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  style: { type: String, required: true },
  images: { type: [String], required: true },
  files: { type: [String], required: false }, // For STL and other 3D files
  size: { type: String, required: true },
  weight: { type: Number, required: true },
  font: { type: mongoose.Schema.Types.ObjectId, ref: "Font", required: false },
  description: { type: String, required: false },
});

const Catalog = mongoose.models.Catalog || mongoose.model("Catalog", catalogSchema);

export default Catalog;