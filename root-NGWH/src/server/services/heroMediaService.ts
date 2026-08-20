import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MEDIA_DIR = process.env.MEDIA_ROOT || path.join(process.cwd(), "media");

export type HeroMediaCategory = "image" | "video" | "auto";

export interface SaveHeroFileResult {
  ok: boolean;
  url?: string;
  error?: string;
}

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];

const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm"];
const ALLOWED_VIDEO_MIMES = ["video/mp4", "video/webm"];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Validates and saves an uploaded file for hero background media or poster.
 *
 * @param file The Uploaded File object from FormData
 * @param category "image", "video", or "auto"
 */
export async function saveUploadedHeroFile(
  file: File,
  category: HeroMediaCategory = "auto"
): Promise<SaveHeroFileResult> {
  if (!file || !(file instanceof File) || file.size === 0 || !file.name) {
    return { ok: false, error: "File tải lên không hợp lệ hoặc rỗng." };
  }

  const ext = path.extname(file.name).toLowerCase();
  const mime = file.type ? file.type.toLowerCase() : "";

  let detectedCategory: "image" | "video";

  if (category === "auto") {
    if (ALLOWED_IMAGE_EXTENSIONS.includes(ext) || ALLOWED_IMAGE_MIMES.includes(mime)) {
      detectedCategory = "image";
    } else if (ALLOWED_VIDEO_EXTENSIONS.includes(ext) || ALLOWED_VIDEO_MIMES.includes(mime)) {
      detectedCategory = "video";
    } else {
      return {
        ok: false,
        error: "Định dạng file không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WebP) hoặc video (MP4, WebM).",
      };
    }
  } else {
    detectedCategory = category;
  }

  if (detectedCategory === "image") {
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return {
        ok: false,
        error: `Đuôi file "${ext}" không đúng định dạng ảnh cho phép (JPG, JPEG, PNG, WebP).`,
      };
    }
    if (mime && !ALLOWED_IMAGE_MIMES.includes(mime)) {
      return {
        ok: false,
        error: `MIME type "${mime}" không phải định dạng ảnh hợp lệ.`,
      };
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        ok: false,
        error: `Dung lượng hình ảnh vượt quá giới hạn 10MB (Kích thước: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      };
    }
  } else if (detectedCategory === "video") {
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
      return {
        ok: false,
        error: `Đuôi file "${ext}" không đúng định dạng video cho phép (MP4, WebM).`,
      };
    }
    if (mime && !ALLOWED_VIDEO_MIMES.includes(mime)) {
      return {
        ok: false,
        error: `MIME type "${mime}" không phải định dạng video hợp lệ.`,
      };
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return {
        ok: false,
        error: `Dung lượng video vượt quá giới hạn 50MB (Kích thước: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      };
    }
  }

  // Prevent path traversal and sanitize filename
  const baseName = path.basename(file.name);
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9_.-]/g, "_");

  const fileUuid = crypto.randomUUID();
  const relDir = path.join("hero", fileUuid);
  const targetDir = path.join(MEDIA_DIR, relDir);

  await fs.mkdir(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, sanitizedName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(targetPath, buffer);

  const publicUrl = `/media/hero/${fileUuid}/${sanitizedName}`;
  return { ok: true, url: publicUrl };
}
