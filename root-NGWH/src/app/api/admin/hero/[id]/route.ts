import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { updateHeroSlide, deleteHeroSlide } from "@/server/repositories/heroRepository";
import { saveUploadedHeroFile } from "@/server/services/heroMediaService";

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
  const slideId = parseInt(id, 10);
  if (isNaN(slideId)) {
    return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    const updateData: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();

      const title = formData.get("title");
      if (title !== null) updateData.title = String(title).trim();

      const description = formData.get("description");
      if (description !== null) updateData.description = String(description).trim();

      const videoSrc = formData.get("video_src");
      if (videoSrc !== null) updateData.video_src = String(videoSrc).trim();

      const posterSrc = formData.get("poster_src");
      if (posterSrc !== null) updateData.poster_src = String(posterSrc).trim();

      const ctaLabel = formData.get("cta_label");
      if (ctaLabel !== null) updateData.cta_label = String(ctaLabel).trim();

      const ctaLink = formData.get("cta_link");
      if (ctaLink !== null) updateData.cta_link = String(ctaLink).trim();

      const orderStr = formData.get("display_order");
      if (orderStr !== null) {
        const parsed = parseInt(String(orderStr), 10);
        if (!isNaN(parsed)) updateData.display_order = parsed;
      }

      const enabledStr = formData.get("is_enabled");
      if (enabledStr !== null) {
        updateData.is_enabled = String(enabledStr) === "true" || String(enabledStr) === "1";
      }

      const videoFile = formData.get("video_file");
      if (videoFile && videoFile instanceof File && videoFile.size > 0) {
        const saved = await saveUploadedHeroFile(videoFile, "auto");
        if (!saved.ok) {
          return NextResponse.json({ error: saved.error }, { status: 400 });
        }
        updateData.video_src = saved.url!;
      }

      const posterFile = formData.get("poster_file");
      if (posterFile && posterFile instanceof File && posterFile.size > 0) {
        const saved = await saveUploadedHeroFile(posterFile, "image");
        if (!saved.ok) {
          return NextResponse.json({ error: saved.error }, { status: 400 });
        }
        updateData.poster_src = saved.url!;
      }
    } else {
      const body = await request.json();
      Object.assign(updateData, body);
    }

    const updated = await updateHeroSlide(slideId, updateData);
    if (!updated) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
    }

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
      revalidatePath("/admin/homepage/hero");
    } catch {
      // Ignore cache revalidation errors if static/test
    }

    return NextResponse.json({ slide: updated });
  } catch (err) {
    console.error("PATCH /api/admin/hero/[id] error:", err);
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 });
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
  const slideId = parseInt(id, 10);
  if (isNaN(slideId)) {
    return NextResponse.json({ error: "Invalid slide ID" }, { status: 400 });
  }

  const deleted = await deleteHeroSlide(slideId);
  if (!deleted) {
    return NextResponse.json({ error: "Hero slide not found" }, { status: 404 });
  }

  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/admin/homepage/hero");
  } catch {
    // Ignore cache revalidation errors if static/test
  }

  return NextResponse.json({ success: true });
}
