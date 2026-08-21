export const MAX_CLUB_MEDIA_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const ALLOWED_CLUB_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export interface MediaValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateClubMediaFile(file: File): MediaValidationResult {
  if (!file || !(file instanceof File)) {
    return { isValid: false, error: "Invalid file object." };
  }

  // 1. Check size limit FIRST before any buffer allocation
  if (file.size > MAX_CLUB_MEDIA_SIZE_BYTES) {
    return {
      isValid: false,
      error: "File exceeds the maximum allowed size of 20 MB.",
    };
  }

  // 2. Check MIME type string
  const mimeType = (file.type || "").toLowerCase().trim();

  if (
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/") ||
    mimeType === "application/octet-stream" ||
    !ALLOWED_CLUB_MEDIA_MIME_TYPES.has(mimeType)
  ) {
    return {
      isValid: false,
      error: "Unsupported file type.",
    };
  }

  return { isValid: true };
}

/**
 * Validates actual binary magic bytes (header signature) against reported MIME type
 * to prevent client-side MIME spoofing.
 */
export function validateFileBufferSignature(
  buffer: Uint8Array,
  mimeType: string
): boolean {
  if (!buffer || buffer.length < 4) return false;

  const normalizedMime = (mimeType || "").toLowerCase().trim();

  // PNG magic bytes: 89 50 4E 47
  if (normalizedMime === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // JPEG / JPG magic bytes: FF D8 FF
  if (normalizedMime === "image/jpeg" || normalizedMime === "image/jpg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PDF magic bytes: %PDF -> 25 50 44 46
  if (normalizedMime === "application/pdf") {
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  // WebP magic bytes: RIFF (offset 0) and WEBP (offset 8)
  if (normalizedMime === "image/webp") {
    if (buffer.length < 12) return false;
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}
