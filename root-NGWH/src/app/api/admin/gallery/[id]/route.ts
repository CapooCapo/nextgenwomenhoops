import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { deleteGalleryItem } from "@/server/repositories/adminContentRepository";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid gallery item ID" }, { status: 400 });
  }

  const deleted = await deleteGalleryItem(itemId);
  if (!deleted) {
    return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
