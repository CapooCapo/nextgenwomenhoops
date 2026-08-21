import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";

export async function PATCH() {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Hero section is static and managed via source code." },
    { status: 405 }
  );
}

export async function DELETE() {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Hero section is static and managed via source code." },
    { status: 405 }
  );
}
