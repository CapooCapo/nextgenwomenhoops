import { NextResponse } from "next/server";
import { getUserSession } from "@/server/auth/userAuth";

export async function GET() {
  const session = await getUserSession();
  if (!session.authenticated || !session.user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session.user });
}
