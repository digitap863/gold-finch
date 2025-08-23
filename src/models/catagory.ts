import mongoose from "mongoose";

const catagorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { timestamps: true }
);

const Catagory = mongoose.models.Catagory || mongoose.model("Catagory", catagorySchema);

export default Catagory;