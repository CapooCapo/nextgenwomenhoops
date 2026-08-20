import { NextResponse } from "next/server";
import { requireAdminRole } from "@/server/auth/adminAuth";
import { findAllHeroSlides, createHeroSlide } from "@/server/repositories/heroRepository";
import { saveUploadedHeroFile } from "@/server/services/heroMediaService";

export async function GET() {
  const auth = await requireAdminRole("admin", "subadmin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await findAllHeroSlides();
  return NextResponse.json({ slides });
}

export async function POST(request: Request) {
  const auth = await requireAdminRole("admin");
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!auth.allowed) {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    let slide_id = "";
    let title = "";
    let description = "";
    let video_src = "";
    let poster_src = "";
    let cta_label = "";
    let cta_link = "";
    let display_order = 0;
    let is_enabled = true;

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      slide_id = (formData.get("slide_id") as string || "").trim();
      title = (formData.get("title") as string || "").trim();
      description = (formData.get("description") as string || "").trim();
      video_src = (formData.get("video_src") as string || "").trim();
      poster_src = (formData.get("poster_src") as string || "").trim();
      cta_label = (formData.get("cta_label") as string || "").trim();
      cta_link = (formData.get("cta_link") as string || "").trim();

      const orderStr = formData.get("display_order") as string | null;
      if (orderStr) display_order = parseInt(orderStr, 10) || 0;

      const enabledStr = formData.get("is_enabled") as string | null;
      if (enabledStr !== null) is_enabled = enabledStr === "true" || enabledStr === "1";

      const videoFile = formData.get("video_file");
      if (videoFile && videoFile instanceof File && videoFile.size > 0) {
        const saved = await saveUploadedHeroFile(videoFile, "auto");
        if (!saved.ok) {
          return NextResponse.json({ error: saved.error }, { status: 400 });
        }
        video_src = saved.url!;
      }

      const posterFile = formData.get("poster_file");
      if (posterFile && posterFile instanceof File && posterFile.size > 0) {
        const saved = await saveUploadedHeroFile(posterFile, "image");
        if (!saved.ok) {
          return NextResponse.json({ error: saved.error }, { status: 400 });
        }
        poster_src = saved.url!;
      }
    } else {
      const body = await request.json();
      slide_id = (body.slide_id || "").trim();
      title = (body.title || "").trim();
      description = (body.description || "").trim();
      video_src = (body.video_src || "").trim();
      poster_src = (body.poster_src || "").trim();
      cta_label = (body.cta_label || "").trim();
      cta_link = (body.cta_link || "").trim();
      if (body.display_order !== undefined) display_order = parseInt(body.display_order, 10) || 0;
      if (body.is_enabled !== undefined) is_enabled = Boolean(body.is_enabled);
    }

    if (!slide_id || !video_src) {
      return NextResponse.json(
        { error: "Vui lòng nhập Slide ID và cung cấp file media hoặc URL cho Video / Ảnh nền." },
        { status: 400 }
      );
    }

    const newSlide = await createHeroSlide({
      slide_id,
      video_src,
      title,
      description,
      poster_src,
      cta_label,
      cta_link,
      display_order,
      is_enabled,
    });

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
      revalidatePath("/admin/homepage/hero");
    } catch {
      // Ignore cache revalidation errors if static/test
    }

    return NextResponse.json({ slide: newSlide }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/hero error:", err);
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 });
  }
}
