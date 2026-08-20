import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import { deletePlayerAdmin } from "@/server/repositories/adminPlayersRepository";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const playerId = parseInt(id, 10);
  if (isNaN(playerId)) {
    return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
  }

  const deleted = await deletePlayerAdmin(playerId);
  if (!deleted) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
