import {
  getApprovedClubsList,
  registerNewClub,
} from "@/server/services/clubsServerService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceRegion = searchParams.get("province_region") || undefined;
    const clubs = await getApprovedClubsList(provinceRegion);
    return NextResponse.json(clubs, { status: 200 });
  } catch {
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

    const result = await registerNewClub(formData);
    if (!result.ok) {
      return NextResponse.json(result.errors, { status: result.status });
    }
    return NextResponse.json(result.club, { status: 201 });
  } catch {
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
