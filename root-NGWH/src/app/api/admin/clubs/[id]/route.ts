import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/server/auth/adminAuth";
import {
  updateClubApprovalStatus,
  deleteClubById,
} from "@/server/repositories/adminClubsRepository";

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
  const clubId = parseInt(id, 10);
  if (isNaN(clubId)) {
    return NextResponse.json({ error: "Invalid club ID" }, { status: 400 });
  }

  const body = await request.json();
  const { is_approved } = body;

  if (typeof is_approved !== "boolean") {
    return NextResponse.json(
      { error: "is_approved boolean is required" },
      { status: 400 }
    );
  }

  const updated = await updateClubApprovalStatus(clubId, is_approved);
  if (!updated) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  revalidatePath(`/clubs/${clubId}`);
  revalidatePath("/clubs");
  revalidatePath("/api/clubs");
  revalidatePath("/account/clubs");
  revalidatePath("/");

  return NextResponse.json({ success: true, club: updated });
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
  const clubId = parseInt(id, 10);
  if (isNaN(clubId)) {
    return NextResponse.json({ error: "Invalid club ID" }, { status: 400 });
  }

  const deleted = await deleteClubById(clubId);
  if (!deleted) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  revalidatePath(`/clubs/${clubId}`);
  revalidatePath("/clubs");
  revalidatePath("/api/clubs");
  revalidatePath("/account/clubs");
  revalidatePath("/");

  return NextResponse.json({ success: true });
}
