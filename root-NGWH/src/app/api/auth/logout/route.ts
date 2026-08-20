import { NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/server/auth/userAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(USER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
  return response;
}
