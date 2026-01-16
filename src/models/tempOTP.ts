import mongoose from "mongoose";

const tempOTPSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto-delete when expired
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

const TempOTP = mongoose.models.TempOTP || mongoose.model("TempOTP", tempOTPSchema);

export default TempOTP;
