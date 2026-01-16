import { connect } from "@/db.Config/db.Config";
import { formatMobileNumber, getMobileVariations } from "@/helpers/mobileUtils";
import { generateOTP } from "@/helpers/smsService";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting configuration
const OTP_RATE_LIMIT = 3; // Max OTP requests
const OTP_RATE_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function POST(req: NextRequest) {
  try {
    const { mobile, context } = await req.json();

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    // Ensure DB connection before any reads
    await connect();

    const variations = getMobileVariations(mobile);
    
    // If this is for signup, ensure the mobile is not already registered
    if (context === "signup") {
      const existing = await User.findOne({ mobile: { $in: variations } });
      if (existing) {
        return NextResponse.json(
          { error: "This mobile number is already registered" },
          { status: 409 }
        );
      }
    }

    // For login/forgot password, find the user
    let user = null;
    if (context !== "signup") {
      for (const mobileFormat of variations) {
        user = await User.findOne({ mobile: mobileFormat });
        if (user) break;
      }

      if (!user) {
        return NextResponse.json(
          { error: "No account found with this mobile number" },
          { status: 404 }
        );
      }

      // Check rate limiting
      const now = new Date();
      const windowStart = user.otpRequestWindowStart || new Date(0);
      const timeSinceWindowStart = now.getTime() - windowStart.getTime();

      if (timeSinceWindowStart < OTP_RATE_WINDOW) {
        // Within the same window
        if (user.otpRequestCount >= OTP_RATE_LIMIT) {
          const remainingTime = Math.ceil((OTP_RATE_WINDOW - timeSinceWindowStart) / 60000);
          return NextResponse.json(
            { error: `Too many OTP requests. Please try again in ${remainingTime} minutes.` },
            { status: 429 }
          );
        }
        user.otpRequestCount += 1;
      } else {
        // New window
        user.otpRequestWindowStart = now;
        user.otpRequestCount = 1;
      }

      // Generate and store OTP
      const otpCode = generateOTP();
      const otpExpiry = new Date(Date.now() + OTP_EXPIRY);

      user.otpCode = otpCode;
      user.otpExpires = otpExpiry;
      user.otpVerified = false;
      user.otpAttempts = 0; // Reset attempts for new OTP

      await user.save();

      // Send OTP via SMS Gateway
      const cleanMobile = formatMobileNumber(mobile);



      console.log(otpCode)
      // const smsResult = await sendOTP(cleanMobile, otpCode);

      // if (!smsResult.success) {
      //   return NextResponse.json(
      //     { error: smsResult.message || "Failed to send OTP" },
      //     { status: 500 }
      //   );
      // }






      // Log OTP in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP sent to ${cleanMobile}: ${otpCode}`);
      }

      return NextResponse.json({ 
        message: "OTP sent successfully",
        // Include OTP in development mode for testing
        ...(process.env.NODE_ENV === 'development' && { otpCode })
      });
    }

    // For signup context, store OTP in TempOTP collection (user doesn't exist yet)
    const otpCode = generateOTP();
    const cleanMobile = formatMobileNumber(mobile);

    // Store OTP in TempOTP collection
    const TempOTP = (await import('@/models/tempOTP')).default;
    await TempOTP.findOneAndUpdate(
      { mobile: cleanMobile },
      { 
        code: otpCode, 
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        attempts: 0 
      },
      { upsert: true, new: true }
    );

    console.log(otpCode)
    
    // const smsResult = await sendOTP(cleanMobile, otpCode);

    // if (!smsResult.success) {
    //   return NextResponse.json(
    //     { error: smsResult.message || "Failed to send OTP" },
    //     { status: 500 }
    //   );
    // }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Signup OTP sent to ${cleanMobile}: ${otpCode}`);
    }

    return NextResponse.json({ 
      message: "OTP sent successfully",
      // Include OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { otpCode })
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    const message = error?.message || "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


