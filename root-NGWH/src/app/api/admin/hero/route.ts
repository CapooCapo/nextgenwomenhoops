import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import { findAllHeroSlides, createHeroSlide } from "@/server/repositories/heroRepository";

export async function GET() {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await findAllHeroSlides();
  return NextResponse.json({ slides });
}

export async function POST(request: Request) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slide_id, video_src, title, description, poster_src, cta_label, cta_link, display_order, is_enabled } = body;

    if (!slide_id || !video_src) {
      return NextResponse.json(
        { error: "slide_id and video_src are required" },
        { status: 400 }
      );
    }

    const newSlide = await createHeroSlide({
      slide_id,
      video_src,
      title,
      description,
      poster_src,
      cta_label,
      cta_link,
      display_order,
      is_enabled,
    });

    return NextResponse.json({ slide: newSlide }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 });
  }
}
