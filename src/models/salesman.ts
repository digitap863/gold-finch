import mongoose from "mongoose";

const salesmanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: false },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  shopAddress: { type: String, required: true },
  shopName: { type: String, required: true },
  shopMobile: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Salesman = mongoose.models.Salesman || mongoose.model("Salesman", salesmanSchema);

export default Salesman;