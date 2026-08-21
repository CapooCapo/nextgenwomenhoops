import { query, queryOne } from "../db/client";

export interface ClubMediaRow {
  id: number;
  club_id: number;
  media_type: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  data?: Buffer;
  created_at?: Date;
  updated_at?: Date;
}

export interface InsertClubMediaParams {
  club_id: number;
  media_type: "logo" | "capability_profile" | "u20_athlete";
  filename: string;
  mime_type: string;
  size_bytes: number;
  data: Buffer;
}

/**
 * Inserts binary media into PostgreSQL `club_media` BYTEA column.
 * Returns metadata without returning binary data.
 */
export async function insertClubMedia(
  params: InsertClubMediaParams
): Promise<ClubMediaRow> {
  const rows = await query<ClubMediaRow>(
    `INSERT INTO club_media (club_id, media_type, filename, mime_type, size_bytes, data)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, club_id, media_type, filename, mime_type, size_bytes, created_at, updated_at`,
    [
      params.club_id,
      params.media_type,
      params.filename,
      params.mime_type,
      params.size_bytes,
      params.data,
    ]
  );
  return rows[0];
}

/**
 * Fetches media by ID, including the binary data BYTEA buffer.
 * Used exclusively by the media retrieval route handler.
 */
export async function getClubMediaById(
  id: number
): Promise<ClubMediaRow | null> {
  return queryOne<ClubMediaRow>(
    `SELECT id, club_id, media_type, filename, mime_type, size_bytes, data, created_at, updated_at
     FROM club_media
     WHERE id = $1`,
    [id]
  );
}

/**
 * Fetches media metadata for a club without loading binary data.
 */
export async function getClubMediaMetadataByClubId(
  clubId: number,
  mediaType?: string
): Promise<ClubMediaRow[]> {
  if (mediaType) {
    return query<ClubMediaRow>(
      `SELECT id, club_id, media_type, filename, mime_type, size_bytes, created_at, updated_at
       FROM club_media
       WHERE club_id = $1 AND media_type = $2
       ORDER BY id ASC`,
      [clubId, mediaType]
    );
  }

  return query<ClubMediaRow>(
    `SELECT id, club_id, media_type, filename, mime_type, size_bytes, created_at, updated_at
     FROM club_media
     WHERE club_id = $1
     ORDER BY id ASC`,
    [clubId]
  );
}

/**
 * Deletes media records for a given club and media type.
 */
export async function deleteClubMediaByType(
  clubId: number,
  mediaType: string
): Promise<void> {
  await query(`DELETE FROM club_media WHERE club_id = $1 AND media_type = $2`, [
    clubId,
    mediaType,
  ]);
}

/**
 * Deletes a single media record by ID.
 */
export async function deleteClubMediaById(id: number): Promise<void> {
  await query(`DELETE FROM club_media WHERE id = $1`, [id]);
}
