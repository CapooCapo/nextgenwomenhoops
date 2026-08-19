import { getSeasonsList } from "@/server/services/seasonsServerService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const seasons = await getSeasonsList();
    return NextResponse.json(seasons, { status: 200 });
  } catch {
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
