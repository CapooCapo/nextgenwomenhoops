import { getMatchesList } from "@/server/services/matchesServerService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const matches = await getMatchesList();
    return NextResponse.json(matches, { status: 200 });
  } catch {
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
