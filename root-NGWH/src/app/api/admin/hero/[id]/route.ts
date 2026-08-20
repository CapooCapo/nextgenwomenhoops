import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import { updateHeroSlide, deleteHeroSlide } from "@/server/repositories/heroRepository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const slideId = parseInt(id, 10);
  if (isNaN(slideId)) {
    return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
  }

  const body = await request.json();
  const updated = await updateHeroSlide(slideId, body);
  if (!updated) {
    return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
  }

  return NextResponse.json({ slide: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const slideId = parseInt(id, 10);
  if (isNaN(slideId)) {
    return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
  }

  const deleted = await deleteHeroSlide(slideId);
  if (!deleted) {
    return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
