import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import { deleteSeason } from "@/server/repositories/adminTournamentsRepository";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const seasonId = parseInt(id, 10);
  if (isNaN(seasonId)) {
    return NextResponse.json({ error: "Invalid season ID" }, { status: 400 });
  }

  const deleted = await deleteSeason(seasonId);
  if (!deleted) {
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
