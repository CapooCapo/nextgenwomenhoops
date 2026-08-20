import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  updateUserPassword,
} from "@/server/repositories/userRepository";
import { hashPassword } from "@/server/auth/userAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await findValidPasswordResetToken(tokenHash);

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(newPassword);
    await updateUserPassword(record.user_id, passwordHash);
    await markPasswordResetTokenUsed(record.id);

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. Please log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
