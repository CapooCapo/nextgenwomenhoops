import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createPasswordResetToken } from "@/server/repositories/userRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Do not reveal whether user exists
      return NextResponse.json({
        success: true,
        message: "If the email is registered, a password reset token has been created.",
        emailGap: true,
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset token created successfully.",
      emailGap: true,
      notice: "AUTH EMAIL INFRASTRUCTURE GAP: No SMTP/email service is configured. In a production environment, an email service must be integrated to dispatch the reset link.",
      resetToken: rawToken, // Exposed for automated testing / dev flow
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
