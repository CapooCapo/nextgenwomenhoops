import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getClubMediaById } from "@/server/repositories/clubMediaRepository";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 1. Check if this is a PostgreSQL BYTEA Club media request: /media/clubs/:clubId/:mediaType/:mediaId
    if (pathSegments.length >= 3 && pathSegments[0] === "clubs") {
      const mediaIdStr = pathSegments[pathSegments.length - 1];
      const mediaId = Number(mediaIdStr);
      if (!isNaN(mediaId) && mediaId > 0) {
        const clubId = Number(pathSegments[1]);
        const mediaType = pathSegments[2];
        const media = await getClubMediaById(mediaId);

        if (
          media &&
          media.data &&
          (isNaN(clubId) || media.club_id === clubId) &&
          (!mediaType || media.media_type === mediaType)
        ) {
          const buffer = Buffer.isBuffer(media.data)
            ? media.data
            : Buffer.from(media.data);

          const uint8Array = new Uint8Array(
            buffer.buffer,
            buffer.byteOffset,
            buffer.byteLength
          );

          return new NextResponse(uint8Array as unknown as BodyInit, {
            status: 200,
            headers: {
              "Content-Type": media.mime_type || "application/octet-stream",
              "Content-Length": String(buffer.length),
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Content-Type-Options": "nosniff",
            },
          });
        }

        // If numeric mediaId requested under /media/clubs/... but not in DB, return 404
        if (!isNaN(clubId)) {
          return new NextResponse("Not Found", { status: 404 });
        }
      }
    }

    // 2. Fallback to static/legacy local filesystem media serving
    const mediaDir = process.env.MEDIA_ROOT || path.join(process.cwd(), "media");
    const relativePath = path.join(...pathSegments);
    const resolvedPath = path.resolve(/*turbopackIgnore: true*/ mediaDir, relativePath);

    // Prevent directory traversal attack
    const resolvedMediaDir = path.resolve(/*turbopackIgnore: true*/ mediaDir);
    const rel = path.relative(resolvedMediaDir, resolvedPath);
    if (rel.startsWith("..") || path.isAbsolute(rel) || rel === "") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let stats;
    try {
      stats = await fs.stat(/*turbopackIgnore: true*/ resolvedPath);
      if (stats && typeof stats.isDirectory === "function" && stats.isDirectory()) {
        return new NextResponse("Not Found", { status: 404 });
      }
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileSize = stats.size;
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const rangeHeader = request.headers.get("range");

    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
            "Accept-Ranges": "bytes",
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileBuffer = await fs.readFile(/*turbopackIgnore: true*/ resolvedPath);
      const chunk = fileBuffer.subarray(start, end + 1);
      const chunkUint8 = new Uint8Array(
        chunk.buffer,
        chunk.byteOffset,
        chunk.byteLength
      );

      return new NextResponse(chunkUint8, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunk.length),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const fileBuffer = await fs.readFile(/*turbopackIgnore: true*/ resolvedPath);
    const fileUint8 = new Uint8Array(
      fileBuffer.buffer,
      fileBuffer.byteOffset,
      fileBuffer.byteLength
    );

    return new NextResponse(fileUint8, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.length),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
