import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "salesman"],
    required: true,
    default: "salesman",
  },
  isBlocked: { type: Boolean, default: false },
  requestStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  
  // Salesman-specific fields
  shopName: { type: String },
  shopAddress: { type: String },
  shopMobile: { type: String },
  isApproved: { type: Boolean, default: false },
  
  // OTP fields for password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // OTP fields for password reset
  otpCode: { type: String },
  otpExpires: { type: Date },
  otpVerified: { type: Boolean, default: false },
  
  // OTP verification tracking (for security)
  otpAttempts: { type: Number, default: 0 },
  otpLastAttempt: { type: Date },
  otpRequestCount: { type: Number, default: 0 },
  otpRequestWindowStart: { type: Date },

}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;