import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address:{type:String, required: true},
    gstNumber: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Shop = mongoose.models.Shop || mongoose.model("Shop", shopSchema);

export default Shop;
