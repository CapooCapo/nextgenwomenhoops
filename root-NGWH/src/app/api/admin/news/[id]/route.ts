import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import {
  findNewsById,
  updateNewsArticle,
  deleteNewsArticle,
} from "@/server/repositories/adminContentRepository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRole("admin", "subadmin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  const article = await findNewsById(articleId);
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, category, summary, content, image_url } = body;

    const updated = await updateNewsArticle(articleId, {
      title,
      category,
      summary,
      content,
      image_url,
    });

    if (!updated) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/news");
      revalidatePath("/");
    } catch {
      // Ignore cache revalidation errors if static
    }

    return NextResponse.json({ article: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
  }

  const deleted = await deleteNewsArticle(articleId);
  if (!deleted) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/news");
    revalidatePath("/");
  } catch {
    // Ignore cache revalidation errors if static
  }

  return NextResponse.json({ success: true });
}
