import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { findAllSeasons } from "@/server/repositories/seasonsRepository";
import { createSeason } from "@/server/repositories/adminTournamentsRepository";

export async function GET() {
  const auth = await requireAdminRole("admin", "subadmin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seasons = await findAllSeasons();
  return NextResponse.json({ seasons });
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
    const { year, tournament_id } = body;
    if (!year || typeof year !== "number") {
      return NextResponse.json({ error: "Numeric year is required" }, { status: 400 });
    }

    const newSeason = await createSeason({ year, tournament_id });
    return NextResponse.json({ season: newSeason }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create season" }, { status: 500 });
  }
}
