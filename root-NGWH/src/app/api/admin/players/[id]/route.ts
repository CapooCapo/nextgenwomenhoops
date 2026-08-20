import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { deletePlayerAdmin } from "@/server/repositories/adminPlayersRepository";

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
  const playerId = parseInt(id, 10);
  if (isNaN(playerId)) {
    return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
  }

  const deleted = await deletePlayerAdmin(playerId);
  if (!deleted) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/clubs");
  } catch {
    // Ignore
  }

  return NextResponse.json({ success: true });
}
