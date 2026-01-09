import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { formatMobileNumber, getMobileVariations } from "@/helpers/mobileUtils";
import { connect } from "@/db.Config/db.Config";
import User from "@/models/user";

export async function POST(req: NextRequest) {
  try {
    const { mobile, context } = await req.json();

    if (!mobile) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }

    // Ensure DB connection before any reads
    await connect();

    // If this is for signup, ensure the mobile is not already registered
    if (context === "signup") {
      const variations = getMobileVariations(mobile);
      const existing = await User.findOne({ mobile: { $in: variations } });
      if (existing) {
        return NextResponse.json(
          { error: "This mobile number is already registered" },
          { status: 409 }
        );
      }
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      return NextResponse.json({ error: "Twilio Verify is not configured" }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    const cleanMobile = formatMobileNumber(mobile);
    const to = `+${cleanMobile}`;

    await client.verify.v2.services(verifyServiceSid).verifications.create({ to, channel: "sms" });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    const message = error?.message || "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


