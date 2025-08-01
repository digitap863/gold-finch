import mongoose from "mongoose";

const catalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: { type: [String], required: true },
  files: { type: [String], required: false }, // For STL and other 3D files
  size: { type: String, required: true },
  weight: { type: Number, required: true },
  description: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Catalog = mongoose.models.Catalog || mongoose.model("Catalog", catalogSchema);

export default Catalog;