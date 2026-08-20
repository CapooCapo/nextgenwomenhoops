import {
  getApprovedClubsList,
  registerNewClub,
} from "@/server/services/clubsServerService";
import { getUserSession } from "@/server/auth/userAuth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceRegion = searchParams.get("province_region") || undefined;
    const search = searchParams.get("search") || undefined;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const result = await getApprovedClubsList({
      provinceRegion,
      search,
      page,
      limit,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("GET /api/clubs error:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      formData = await request.formData();
    } else {
      // Fallback for JSON body
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

    const session = await getUserSession();
    const result = await registerNewClub(formData, session.user?.id);
    if (!result.ok) {
      return NextResponse.json(result.errors, { status: result.status });
    }
    return NextResponse.json(result.club, { status: 201 });
  } catch (err) {
    console.error("POST /api/clubs error:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
