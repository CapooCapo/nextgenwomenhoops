import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import {
  findAllPlayersAdmin,
  createPlayerAdmin,
} from "@/server/repositories/adminPlayersRepository";

export async function GET(request: Request) {
  const auth = await requireAdminRole("admin", "subadmin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clubIdParam = searchParams.get("club_id");
  const clubId = clubIdParam ? parseInt(clubIdParam, 10) : undefined;

  const players = await findAllPlayersAdmin(clubId);
  return NextResponse.json({ players });
}

export async function POST(request: Request) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { club_id, name } = body;

    if (!club_id || !name) {
      return NextResponse.json(
        { error: "club_id and name are required" },
        { status: 400 }
      );
    }

    const player = await createPlayerAdmin(club_id, name);
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/clubs/${club_id}`);
      revalidatePath("/clubs");
    } catch {
      // Ignore
    }
    return NextResponse.json({ player }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
