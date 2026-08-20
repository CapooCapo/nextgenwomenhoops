import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/server/auth/adminAuth";
import { findAllNews, createNewsArticle } from "@/server/repositories/adminContentRepository";

export async function GET() {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await findAllNews();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const isAuth = await requireAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, category, summary, content, image_url } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }

    const newArticle = await createNewsArticle({
      title,
      category,
      summary,
      content,
      image_url,
    });

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/news");
      revalidatePath("/");
    } catch {
      // Ignore cache revalidation errors if static
    }

    return NextResponse.json({ article: newArticle }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
