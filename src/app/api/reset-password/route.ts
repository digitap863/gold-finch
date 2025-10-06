import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await connect();
  const { mobile, password } = await req.json();

  if (!mobile || !password) {
    return NextResponse.json({ error: "Mobile number and password are required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
  }

  // Clean and format mobile number (same logic as other APIs)
  let cleanMobile = mobile.replace(/\D/g, ''); // Remove all non-digits
  
  // Auto-add country code for Indian numbers if missing
  if (cleanMobile.length === 10 && (cleanMobile.startsWith('6') || cleanMobile.startsWith('7') || cleanMobile.startsWith('8') || cleanMobile.startsWith('9'))) {
    cleanMobile = '91' + cleanMobile; // Add India country code
  }
  
  // Ensure it starts with country code
  if (!cleanMobile.startsWith('91') && cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile; // Default to India for 10-digit numbers
  }

  // Find user with verified OTP (try multiple mobile formats)
  let user = await User.findOne({
    mobile: mobile,
    otpVerified: true,
    otpExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    user = await User.findOne({
      mobile: `+${cleanMobile}`,
      otpVerified: true,
      otpExpires: { $gt: Date.now() }
    });
  }
  
  if (!user) {
    user = await User.findOne({
      mobile: cleanMobile,
      otpVerified: true,
      otpExpires: { $gt: Date.now() }
    });
  }

  if (!user) {
    return NextResponse.json({ error: "OTP verification required or expired. Please verify your OTP first." }, { status: 400 });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update user password and clear OTP data
  user.password = hashedPassword;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  user.otpVerified = false;
  await user.save();

  return NextResponse.json({ 
    message: "Password has been reset successfully. You can now login with your new password." 
  });
}
