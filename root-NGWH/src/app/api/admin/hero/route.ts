import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { HERO_VIDEO_SLIDES } from "@/config/heroSlides";

export async function GET() {
  const auth = await requireAdminRole("admin", "subadmin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ slides: HERO_VIDEO_SLIDES });
}

export async function POST() {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Hero section is static and managed via source code." },
    { status: 405 }
  );
}
