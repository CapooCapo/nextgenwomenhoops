import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { updateMatch, deleteMatch } from "@/server/repositories/adminTournamentsRepository";

export async function PATCH(
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
  const matchId = parseInt(id, 10);
  if (isNaN(matchId)) {
    return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
  }

  const body = await request.json();
  const updated = await updateMatch(matchId, body);
  if (!updated) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
  } catch {
    // Ignore cache revalidation errors in non-Next runtime
  }

  return NextResponse.json({ match: updated });
}

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
  const matchId = parseInt(id, 10);
  if (isNaN(matchId)) {
    return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
  }

  const deleted = await deleteMatch(matchId);
  if (!deleted) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
