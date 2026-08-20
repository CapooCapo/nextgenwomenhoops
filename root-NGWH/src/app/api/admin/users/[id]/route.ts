import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import {
  toggleAdminUserStatus,
  removeAdminUser,
} from "@/server/services/adminUsersServerService";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ detail: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const params = await props.params;
    const numId = parseInt(params.id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ detail: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body || {};

    if (status !== "active" && status !== "disabled") {
      return NextResponse.json(
        { detail: "Status must be either 'active' or 'disabled'" },
        { status: 400 }
      );
    }

    const result = await toggleAdminUserStatus(numId, status);
    if (!result.ok) {
      return NextResponse.json({ detail: result.message }, { status: result.status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ detail: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const params = await props.params;
    const numId = parseInt(params.id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ detail: "Invalid user ID" }, { status: 400 });
    }

    const result = await removeAdminUser(numId);
    if (!result.ok) {
      return NextResponse.json({ detail: result.message }, { status: result.status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
