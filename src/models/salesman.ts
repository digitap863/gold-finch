import mongoose from "mongoose";

const salesmanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: false },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Salesman = mongoose.models.Salesman || mongoose.model("Salesman", salesmanSchema);

export default Salesman;