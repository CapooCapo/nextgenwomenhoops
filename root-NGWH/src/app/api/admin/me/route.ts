import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/auth/adminAuth";

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: session.username,
    role: session.role,
  });
}
