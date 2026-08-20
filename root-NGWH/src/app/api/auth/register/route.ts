import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/server/repositories/userRepository";
import { hashPassword, createUserToken, USER_COOKIE_NAME } from "@/server/auth/userAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      role: "club_user",
    });

    const token = createUserToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, role: user.role },
      },
      { status: 201 }
    );

    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }
}
