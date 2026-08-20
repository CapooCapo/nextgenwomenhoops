import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { deleteSeason } from "@/server/repositories/adminTournamentsRepository";

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
