import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { findAllClubsAdmin } from "@/server/repositories/adminClubsRepository";

export async function GET(request: Request) {
  const auth = await requireAdminRole("admin", "subadmin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const approvedParam = searchParams.get("approved");
  const search = searchParams.get("search") || undefined;
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit") || searchParams.get("pageSize");

  let isApproved: boolean | undefined = undefined;
  if (approvedParam === "true") isApproved = true;
  if (approvedParam === "false") isApproved = false;

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = limitParam ? parseInt(limitParam, 10) : 20;

  const paginatedResult = await findAllClubsAdmin({
    isApproved,
    search,
    page: isNaN(page) ? 1 : page,
    pageSize: isNaN(pageSize) ? 20 : pageSize,
  });

  return NextResponse.json(paginatedResult);
}
