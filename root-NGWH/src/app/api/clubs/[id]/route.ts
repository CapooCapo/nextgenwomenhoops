import { getApprovedClubDetail } from "@/server/services/clubsServerService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const numId = parseInt(params.id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ detail: "Not found." }, { status: 404 });
    }

    const club = await getApprovedClubDetail(numId);
    if (!club) {
      return NextResponse.json({ detail: "Not found." }, { status: 404 });
    }

    return NextResponse.json(club, { status: 200 });
  } catch {
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
