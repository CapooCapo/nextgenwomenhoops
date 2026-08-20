import { query, queryOne } from "../db/client";
import { ClubRow, CoachStaffRow, PlayerRow } from "../db/types";

export interface CreateClubParams {
  name: string;
  province_region: string;
  representative_name: string;
  logo?: string | null;
  capability_profile?: string | null;
  u20_athlete_list?: string | null;
  is_approved?: boolean;
  user_id?: number | null;
}

export interface FindApprovedClubsParams {
  provinceRegion?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClubsResult {
  clubs: ClubRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function findApprovedClubs(
  provinceRegion?: string
): Promise<ClubRow[]> {
  const result = await findApprovedClubsPaginated({
    provinceRegion,
    limit: 1000,
  });
  return result.clubs;
}

export async function findApprovedClubsPaginated(
  params: FindApprovedClubsParams = {}
): Promise<PaginatedClubsResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 9);
  const offset = (page - 1) * limit;

  const whereConditions: string[] = ["is_approved = true"];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (params.provinceRegion) {
    whereConditions.push(`province_region = $${paramIndex}`);
    queryParams.push(params.provinceRegion);
    paramIndex++;
  }

  if (params.search && params.search.trim()) {
    const searchPattern = `%${params.search.trim()}%`;
    whereConditions.push(
      `(name ILIKE $${paramIndex} OR province_region ILIKE $${paramIndex})`
    );
    queryParams.push(searchPattern);
    paramIndex++;
  }

  const whereClause = whereConditions.join(" AND ");

  const countSql = `SELECT COUNT(*) FROM clubs_club WHERE ${whereClause}`;
  const countResult = await query<{ count: string }>(countSql, queryParams);
  const total = parseInt(countResult[0]?.count || "0", 10);
  const totalPages = Math.ceil(total / limit) || 1;

  const clubsSql = `
    SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list
    FROM clubs_club
    WHERE ${whereClause}
    ORDER BY id ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const clubs = await query<ClubRow>(clubsSql, [...queryParams, limit, offset]);

  return {
    clubs,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function findApprovedClubById(
  id: number
): Promise<ClubRow | null> {
  return queryOne<ClubRow>(
    `SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list, user_id
     FROM clubs_club
     WHERE id = $1 AND is_approved = true`,
    [id]
  );
}

export async function findClubById(id: number): Promise<ClubRow | null> {
  return queryOne<ClubRow>(
    `SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list, user_id
     FROM clubs_club
     WHERE id = $1`,
    [id]
  );
}

export async function findClubsByUserId(userId: number): Promise<ClubRow[]> {
  return query<ClubRow>(
    `SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list, user_id
     FROM clubs_club
     WHERE user_id = $1
     ORDER BY id DESC`,
    [userId]
  );
}

export async function findPlayersByClubId(
  clubId: number
): Promise<PlayerRow[]> {
  return query<PlayerRow>(
    `SELECT id, club_id, name, jersey_number, position, date_of_birth
     FROM players_player
     WHERE club_id = $1
     ORDER BY id ASC`,
    [clubId]
  );
}

export async function findCoachStaffByClubId(
  clubId: number
): Promise<CoachStaffRow[]> {
  return query<CoachStaffRow>(
    `SELECT id, club_id, name, role, description
     FROM players_coachstaff
     WHERE club_id = $1
     ORDER BY id ASC`,
    [clubId]
  );
}

export async function replaceClubPlayers(
  clubId: number,
  players: Array<{
    name: string;
    jersey_number?: string | null;
    position?: string | null;
    date_of_birth?: string | null;
  }>
): Promise<PlayerRow[]> {
  await query(`DELETE FROM players_player WHERE club_id = $1`, [clubId]);

  const inserted: PlayerRow[] = [];
  for (const player of players) {
    if (!player.name || !player.name.trim()) continue;
    const rows = await query<PlayerRow>(
      `INSERT INTO players_player (club_id, name, jersey_number, position, date_of_birth)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, club_id, name, jersey_number, position, date_of_birth`,
      [
        clubId,
        player.name.trim(),
        player.jersey_number || null,
        player.position || null,
        player.date_of_birth || null,
      ]
    );
    if (rows[0]) inserted.push(rows[0]);
  }
  return inserted;
}

export async function replaceClubCoachStaff(
  clubId: number,
  staff: Array<{
    name: string;
    role?: string | null;
    description?: string | null;
  }>
): Promise<CoachStaffRow[]> {
  await query(`DELETE FROM players_coachstaff WHERE club_id = $1`, [clubId]);

  const inserted: CoachStaffRow[] = [];
  for (const member of staff) {
    if (!member.name || !member.name.trim()) continue;
    const rows = await query<CoachStaffRow>(
      `INSERT INTO players_coachstaff (club_id, name, role, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, club_id, name, role, description`,
      [
        clubId,
        member.name.trim(),
        member.role || null,
        member.description || null,
      ]
    );
    if (rows[0]) inserted.push(rows[0]);
  }
  return inserted;
}

export async function createClub(
  params: CreateClubParams
): Promise<ClubRow> {
  const isApproved = params.is_approved ?? false;
  const rows = await query<ClubRow>(
    `INSERT INTO clubs_club (name, province_region, representative_name, logo, capability_profile, u20_athlete_list, is_approved, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list, user_id`,
    [
      params.name,
      params.province_region,
      params.representative_name,
      params.logo || null,
      params.capability_profile || null,
      params.u20_athlete_list || null,
      isApproved,
      params.user_id || null,
    ]
  );
  return rows[0];
}

export async function updateClub(
  id: number,
  params: Partial<ClubRow>
): Promise<ClubRow | null> {
  const updates: string[] = [];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (params.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    queryParams.push(params.name);
  }
  if (params.province_region !== undefined) {
    updates.push(`province_region = $${paramIndex++}`);
    queryParams.push(params.province_region);
  }
  if (params.representative_name !== undefined) {
    updates.push(`representative_name = $${paramIndex++}`);
    queryParams.push(params.representative_name);
  }
  if (params.logo !== undefined) {
    updates.push(`logo = $${paramIndex++}`);
    queryParams.push(params.logo);
  }
  if (params.capability_profile !== undefined) {
    updates.push(`capability_profile = $${paramIndex++}`);
    queryParams.push(params.capability_profile);
  }
  if (params.u20_athlete_list !== undefined) {
    updates.push(`u20_athlete_list = $${paramIndex++}`);
    queryParams.push(params.u20_athlete_list);
  }
  if (params.founding_year !== undefined) {
    updates.push(`founding_year = $${paramIndex++}`);
    queryParams.push(params.founding_year);
  }
  if (params.achievements !== undefined) {
    updates.push(`achievements = $${paramIndex++}`);
    queryParams.push(typeof params.achievements === "string" ? params.achievements : JSON.stringify(params.achievements));
  }
  if (params.contact_info !== undefined) {
    updates.push(`contact_info = $${paramIndex++}`);
    queryParams.push(typeof params.contact_info === "string" ? params.contact_info : JSON.stringify(params.contact_info));
  }
  if (params.social_links !== undefined) {
    updates.push(`social_links = $${paramIndex++}`);
    queryParams.push(typeof params.social_links === "string" ? params.social_links : JSON.stringify(params.social_links));
  }

  if (updates.length === 0) {
    return findClubById(id);
  }

  queryParams.push(id);
  const sql = `
    UPDATE clubs_club
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list, user_id
  `;

  const rows = await query<ClubRow>(sql, queryParams);
  return rows[0] || null;
}
