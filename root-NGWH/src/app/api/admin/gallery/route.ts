import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import { findAllGalleryItems, createGalleryItem } from "@/server/repositories/adminContentRepository";

export async function GET() {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await findAllGalleryItems();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, media_type, media_url, caption } = body;

    if (!title || !media_url) {
      return NextResponse.json({ error: "Title and media_url are required" }, { status: 400 });
    }

    const newItem = await createGalleryItem({
      title,
      category,
      media_type,
      media_url,
      caption,
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}
