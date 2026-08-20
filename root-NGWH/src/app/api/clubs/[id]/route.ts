import {
  getApprovedClubDetail,
  updateOwnerClub,
} from "@/server/services/clubsServerService";
import { getUserSession } from "@/server/auth/userAuth";
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

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const numId = parseInt(params.id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ detail: "Not found." }, { status: 404 });
    }

    const session = await getUserSession();
    if (!session.authenticated || !session.user) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    const contentType = request.headers.get("content-type") || "";

    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      formData = await request.formData();
    } else {
      const body = await request.json();
      formData = new FormData();
      if (body) {
        Object.entries(body).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            formData.append(k, String(v));
          }
        });
      }
    }

    const result = await updateOwnerClub(numId, session.user.id, formData);
    if (!result.ok) {
      return NextResponse.json(
        { detail: result.message || "Failed to update club" },
        { status: result.status }
      );
    }

    return NextResponse.json(result.club, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/clubs/[id] error:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
