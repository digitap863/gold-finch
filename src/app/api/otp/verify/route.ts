import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { formatMobileNumber } from "@/helpers/mobileUtils";

export async function POST(req: NextRequest) {
  try {
    const { mobile, code } = await req.json();

    if (!mobile || !code) {
      return NextResponse.json({ error: "Mobile and code are required" }, { status: 400 });
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

    const check = await client.verify.v2.services(verifyServiceSid).verificationChecks.create({ to, code });

    if (check.status === "approved") {
      return NextResponse.json({ message: "OTP verified", verified: true });
    }

    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    const message = error?.message || "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}






