import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  authenticateAdminCredentials,
  createAdminToken,
} from "@/server/auth/adminAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const isValid = authenticateAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = createAdminToken(username);
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json({ success: true, user: username });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
