import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import {
  findAllPlayersAdmin,
  createPlayerAdmin,
} from "@/server/repositories/adminPlayersRepository";

export async function GET(request: Request) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clubIdParam = searchParams.get("club_id");
  const clubId = clubIdParam ? parseInt(clubIdParam, 10) : undefined;

  const players = await findAllPlayersAdmin(clubId);
  return NextResponse.json({ players });
}

export async function POST(request: Request) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ player }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
