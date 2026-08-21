import {
  insertClubMedia,
  getClubMediaById,
  ClubMediaRow,
} from "../repositories/clubMediaRepository";
import {
  validateClubMediaFile,
  validateFileBufferSignature,
} from "../validation/clubMediaValidation";

export type ClubMediaType = "logo" | "capability_profile" | "u20_athlete";

export interface ValidatedFileResult {
  ok: boolean;
  buffer?: Buffer;
  mimeType?: string;
  error?: string;
}

export interface UploadMediaResult {
  ok: boolean;
  url?: string;
  error?: string;
  mediaId?: number;
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
}

/**
 * Reuses validateClubMediaFile + validateFileBufferSignature exactly as
 * saveClubMediaToDb (clubsServerService) previously did, including the
 * generic/missing MIME-type inference from the file extension. No
 * validation rule changes.
 */
export async function validateAndBuildFile(
  file: File
): Promise<ValidatedFileResult> {
  if (!file || !(file instanceof File) || file.size === 0 || !file.name) {
    return { ok: false };
  }

  let effectiveMime = (file.type || "").toLowerCase().trim();
  if (!effectiveMime || effectiveMime === "application/octet-stream") {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "png") effectiveMime = "image/png";
    else if (ext === "jpg" || ext === "jpeg") effectiveMime = "image/jpeg";
    else if (ext === "webp") effectiveMime = "image/webp";
    else if (ext === "pdf") effectiveMime = "application/pdf";
  }

  const fileToValidate =
    effectiveMime !== file.type
      ? new File([file], file.name, { type: effectiveMime })
      : file;

  const validation = validateClubMediaFile(fileToValidate);
  if (!validation.isValid) {
    return { ok: false, error: validation.error };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const isSignatureValid = validateFileBufferSignature(buffer, effectiveMime);
  if (!isSignatureValid && process.env.NODE_ENV !== "test") {
    return { ok: false, error: "Unsupported file type." };
  }

  return {
    ok: true,
    buffer,
    mimeType: effectiveMime || "application/octet-stream",
  };
}

/**
 * The only place that constructs the current club media URL shape.
 */
export function buildMediaUrl(
  clubId: number,
  mediaType: string,
  mediaId: number
): string {
  return `/media/clubs/${clubId}/${mediaType}/${mediaId}`;
}

export async function uploadMedia(
  clubId: number,
  mediaType: ClubMediaType,
  file: File
): Promise<UploadMediaResult> {
  const validated = await validateAndBuildFile(file);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const inserted = await insertClubMedia({
    club_id: clubId,
    media_type: mediaType,
    filename: file.name,
    mime_type: validated.mimeType!,
    size_bytes: file.size,
    data: validated.buffer!,
  });

  return {
    ok: true,
    url: buildMediaUrl(clubId, mediaType, inserted.id),
    mediaId: inserted.id,
    filename: inserted.filename,
    mimeType: inserted.mime_type,
    sizeBytes: inserted.size_bytes,
  };
}

/**
 * Keeps the media route independent from the repository implementation.
 */
export async function getMediaBuffer(
  mediaId: number
): Promise<ClubMediaRow | null> {
  return getClubMediaById(mediaId);
}

/**
 * Handles: null/empty, already-absolute/already-"/media/"-prefixed,
 * an already-JSON-array string (left untouched for normalizeMediaList to
 * parse), and a bare legacy filesystem-relative path. Exact behavior
 * carried over from clubsServerService's former formatFileUrl.
 */
export function normalizeMediaField(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("/media/") ||
    raw.startsWith("/") ||
    raw.startsWith("[")
  ) {
    return raw;
  }
  return `/media/${raw}`;
}

/**
 * Parses the U20 athlete JSON-array representation, normalizing each
 * entry and preserving order. Falls back to treating the raw value as a
 * single legacy path when it isn't a JSON array. Exact behavior carried
 * over from clubsServerService's former parseU20AthleteImages.
 */
export function normalizeMediaList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => normalizeMediaField(String(item)))
          .filter((url): url is string => !!url);
      }
    } catch {
      // Fallback
    }
  }
  const formatted = normalizeMediaField(raw);
  return formatted ? [formatted] : [];
}
