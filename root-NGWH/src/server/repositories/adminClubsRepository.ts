import { query } from "../db/client";
import { ClubRow } from "../db/types";

export interface AdminClubFilterParams {
  isApproved?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminPaginatedClubs {
  clubs: ClubRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function findAllClubsAdmin(
  params: AdminClubFilterParams = {}
): Promise<AdminPaginatedClubs> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const whereConditions: string[] = [];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (params.isApproved !== undefined) {
    whereConditions.push(`is_approved = $${paramIndex}`);
    queryParams.push(params.isApproved);
    paramIndex++;
  }

  if (params.search && params.search.trim()) {
    const searchPattern = `%${params.search.trim()}%`;
    whereConditions.push(
      `(name ILIKE $${paramIndex} OR province_region ILIKE $${paramIndex} OR representative_name ILIKE $${paramIndex})`
    );
    queryParams.push(searchPattern);
    paramIndex++;
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // 1. Get total count
  const countSql = `SELECT COUNT(*)::int AS count FROM clubs_club ${whereClause}`;
  const countRows = await query<{ count: number }>(countSql, queryParams);
  const total = countRows[0]?.count ? Number(countRows[0].count) : 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // 2. Get paginated data
  const dataQueryParams = [...queryParams, pageSize, offset];
  const limitIndex = paramIndex;
  const offsetIndex = paramIndex + 1;

  const sql = `
    SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list
    FROM clubs_club
    ${whereClause}
    ORDER BY id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const clubs = await query<ClubRow>(sql, dataQueryParams);

  return {
    clubs,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function updateClubApprovalStatus(
  id: number,
  isApproved: boolean
): Promise<ClubRow | null> {
  const rows = await query<ClubRow>(
    `UPDATE clubs_club
     SET is_approved = $1
     WHERE id = $2
     RETURNING id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list`,
    [isApproved, id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function deleteClubById(id: number): Promise<boolean> {
  const rows = await query(
    `DELETE FROM clubs_club WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}
