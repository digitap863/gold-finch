import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";
import twilio from "twilio";
import { formatMobileNumber, getMobileVariations } from "@/helpers/mobileUtils";

export async function POST(req: NextRequest) {
  await connect();
  const { identifier } = await req.json();

  if (!identifier) {
    return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
  }

  // Only allow mobile number for OTP verification
  if (identifier.includes("@")) {
    return NextResponse.json({ error: "Please use your mobile number for password reset" }, { status: 400 });
  }

  // Clean and format mobile number
  const cleanMobile = formatMobileNumber(identifier);
  const mobileVariations = getMobileVariations(identifier);

  // Find user by mobile (try different mobile formats)
  let user = null;
  for (const mobileFormat of mobileVariations) {
    user = await User.findOne({ mobile: mobileFormat });
    if (user) break;
  }

  if (!user) {
    // Return error if user doesn't exist
    return NextResponse.json({ 
      error: "No account found with this mobile number. Please check your number or contact support." 
    }, { status: 404 });
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Save OTP to user
  user.otpCode = otpCode;
  user.otpExpires = otpExpiry;
  user.otpVerified = false;
  await user.save();

  // Initialize Twilio client
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    // Send OTP via SMS
    await client.messages.create({
      body: `Your password reset OTP is: ${otpCode}. This code will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+${cleanMobile}` // Use the properly formatted mobile number
    });

    console.log(`OTP sent to ${user.mobile}: ${otpCode}`); // For development
    
    return NextResponse.json({ 
      message: "OTP sent successfully to your mobile number.",
      success: true,
      // For development only
      otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined
    });
  } catch (error) {
    console.error("Twilio SMS error:", error);
    return NextResponse.json({ 
      error: "Failed to send OTP. Please try again later." 
    }, { status: 500 });
  }
}
