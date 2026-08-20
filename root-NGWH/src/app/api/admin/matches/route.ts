import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import { findAllMatchesWithClubs } from "@/server/repositories/matchesRepository";
import { createMatch } from "@/server/repositories/adminTournamentsRepository";

export async function GET() {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await findAllMatchesWithClubs();
  return NextResponse.json({ matches });
}

export async function POST(request: Request) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { season_id, home_club_id, away_club_id, scheduled_at, venue, status } = body;

    if (!season_id || !home_club_id || !away_club_id || !scheduled_at) {
      return NextResponse.json(
        { error: "season_id, home_club_id, away_club_id, and scheduled_at are required" },
        { status: 400 }
      );
    }

    const newMatch = await createMatch({
      season_id,
      home_club_id,
      away_club_id,
      scheduled_at,
      venue,
      status,
    });

    return NextResponse.json({ match: newMatch }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}
