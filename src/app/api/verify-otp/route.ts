import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function POST(req: NextRequest) {
  await connect();
  const { mobile, otpCode } = await req.json();

  if (!mobile || !otpCode) {
    return NextResponse.json({ error: "Mobile number and OTP code are required" }, { status: 400 });
  }

  // Clean and format mobile number (same logic as forgot-password)
  let cleanMobile = mobile.replace(/\D/g, ''); // Remove all non-digits
  
  // Auto-add country code for Indian numbers if missing
  if (cleanMobile.length === 10 && (cleanMobile.startsWith('6') || cleanMobile.startsWith('7') || cleanMobile.startsWith('8') || cleanMobile.startsWith('9'))) {
    cleanMobile = '91' + cleanMobile; // Add India country code
  }
  
  // Ensure it starts with country code
  if (!cleanMobile.startsWith('91') && cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile; // Default to India for 10-digit numbers
  }

  // Find user with valid OTP (try multiple mobile formats)
  let user = await User.findOne({
    mobile: mobile,
    otpCode: otpCode,
    otpExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    user = await User.findOne({
      mobile: `+${cleanMobile}`,
      otpCode: otpCode,
      otpExpires: { $gt: Date.now() }
    });
  }
  
  if (!user) {
    user = await User.findOne({
      mobile: cleanMobile,
      otpCode: otpCode,
      otpExpires: { $gt: Date.now() }
    });
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired OTP code" }, { status: 400 });
  }

  // Mark OTP as verified
  user.otpVerified = true;
  await user.save();

  return NextResponse.json({ 
    message: "OTP verified successfully. You can now reset your password.",
    verified: true
  });
}
