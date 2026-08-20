import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import {
  getAdminUsersList,
  createSubadminUser,
} from "@/server/services/adminUsersServerService";

export async function GET() {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ detail: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const users = await getAdminUsersList();
    return NextResponse.json({ data: users }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ detail: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username) {
      return NextResponse.json({ detail: "Username is required" }, { status: 400 });
    }

    const result = await createSubadminUser(username, password);
    if (!result.ok) {
      return NextResponse.json({ detail: result.message }, { status: result.status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
