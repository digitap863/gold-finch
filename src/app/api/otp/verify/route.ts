import { connect } from "@/db.Config/db.Config";
import { formatMobileNumber, getMobileVariations } from "@/helpers/mobileUtils";
import TempOTP from "@/models/tempOTP";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

// Maximum OTP verification attempts
const MAX_OTP_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { mobile, code } = await req.json();

    if (!mobile || !code) {
      return NextResponse.json({ error: "Mobile and code are required" }, { status: 400 });
    }

    // Ensure DB connection
    await connect();

    const cleanMobile = formatMobileNumber(mobile);

    // Find user by mobile number (try different formats)
    const variations = getMobileVariations(mobile);
    let user = null;
    
    for (const mobileFormat of variations) {
      user = await User.findOne({ mobile: mobileFormat });
      if (user) break;
    }

    // If user not found, check TempOTP for signup verification
    if (!user) {
      const tempOtp = await TempOTP.findOne({ mobile: cleanMobile });
      
      if (!tempOtp) {
        return NextResponse.json(
          { error: "No OTP found. Please request a new OTP." },
          { status: 400 }
        );
      }

      // Check expiry
      if (new Date() > tempOtp.expiresAt) {
        await TempOTP.deleteOne({ mobile: cleanMobile });
        return NextResponse.json(
          { error: "OTP has expired. Please request a new OTP." },
          { status: 400 }
        );
      }

      // Check attempts
      if (tempOtp.attempts >= MAX_OTP_ATTEMPTS) {
        await TempOTP.deleteOne({ mobile: cleanMobile });
        return NextResponse.json(
          { error: "Maximum verification attempts exceeded. Please request a new OTP." },
          { status: 429 }
        );
      }

      // Verify OTP
      if (tempOtp.code !== code) {
        tempOtp.attempts += 1;
        await tempOtp.save();
        const remainingAttempts = MAX_OTP_ATTEMPTS - tempOtp.attempts;
        return NextResponse.json(
          { error: `Invalid OTP. ${remainingAttempts} attempts remaining.` },
          { status: 400 }
        );
      }

      // Success - delete temp OTP
      await TempOTP.deleteOne({ mobile: cleanMobile });
      return NextResponse.json({ 
        message: "OTP verified successfully", 
        verified: true 
      });
    }

    // Check if OTP exists
    if (!user.otpCode) {
      return NextResponse.json(
        { error: "No OTP found. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (!user.otpExpires || new Date() > user.otpExpires) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check attempt limit
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new OTP." },
        { status: 429 }
      );
    }

    // Verify OTP
    if (user.otpCode !== code) {
      // Increment failed attempts
      user.otpAttempts += 1;
      user.otpLastAttempt = new Date();
      await user.save();

      const remainingAttempts = MAX_OTP_ATTEMPTS - user.otpAttempts;
      
      if (remainingAttempts > 0) {
        return NextResponse.json(
          { error: `Invalid OTP. ${remainingAttempts} attempts remaining.` },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "Maximum verification attempts exceeded. Please request a new OTP." },
          { status: 429 }
        );
      }
    }

    // OTP is valid - mark as verified and clear OTP data
    user.otpVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLastAttempt = new Date();
    await user.save();

    return NextResponse.json({ 
      message: "OTP verified successfully", 
      verified: true 
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    const message = error?.message || "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}






