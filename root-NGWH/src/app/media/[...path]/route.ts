import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getClubMediaById } from "@/server/repositories/clubMediaRepository";
import { findClubById } from "@/server/repositories/clubsRepository";
import { getUserSession } from "@/server/auth/userAuth";
import { getAdminSession } from "@/server/auth/adminAuth";

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

        // clubId must be a real, positive club identifier — never bypass
        // the club/media match check below via a non-numeric segment.
        if (isNaN(clubId) || clubId <= 0) {
          return new NextResponse("Not Found", { status: 404 });
        }

        const media = await getClubMediaById(mediaId);

        if (
          media &&
          media.data &&
          media.club_id === clubId &&
          media.media_type === mediaType
        ) {
          const club = await findClubById(clubId);
          if (!club) {
            return new NextResponse("Not Found", { status: 404 });
          }

          if (!club.is_approved) {
            const [userSession, adminSession] = await Promise.all([
              getUserSession(),
              getAdminSession(),
            ]);
            const isOwner = Boolean(
              userSession.authenticated &&
                userSession.user &&
                club.user_id === userSession.user.id
            );
            const isAdminReader = adminSession.authenticated;
            if (!isOwner && !isAdminReader) {
              return new NextResponse("Not Found", { status: 404 });
            }
          }

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

        // Numeric mediaId requested under /media/clubs/... but not found,
        // or it belongs to a different club/media type — return 404
        // either way, without revealing which.
        return new NextResponse("Not Found", { status: 404 });
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
      const rangeSpec = rangeHeader.slice("bytes=".length);
      const dashIndex = rangeSpec.indexOf("-");
      const startPart = dashIndex >= 0 ? rangeSpec.slice(0, dashIndex) : rangeSpec;
      const endPart = dashIndex >= 0 ? rangeSpec.slice(dashIndex + 1) : "";

      let start: number;
      let end: number;

      if (startPart === "") {
        // Suffix byte range (bytes=-N): the last N bytes of the resource.
        // If N exceeds the file size, the entire file is used (RFC 7233 §2.1).
        const suffixLength = parseInt(endPart, 10);
        if (isNaN(suffixLength) || suffixLength <= 0) {
          return new NextResponse(null, {
            status: 416,
            headers: {
              "Content-Range": `bytes */${fileSize}`,
              "Accept-Ranges": "bytes",
            },
          });
        }
        start = Math.max(fileSize - suffixLength, 0);
        end = fileSize - 1;
      } else {
        start = parseInt(startPart, 10);
        end = endPart ? parseInt(endPart, 10) : fileSize - 1;
      }

      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 0 ||
        start >= fileSize ||
        end >= fileSize ||
        start > end
      ) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
            "Accept-Ranges": "bytes",
          },
        });
      }

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
