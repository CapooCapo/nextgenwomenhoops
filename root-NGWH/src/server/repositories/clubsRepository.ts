import { query, queryOne } from "../db/client";
import { ClubRow, CoachStaffRow, PlayerRow } from "../db/types";

export interface CreateClubParams {
  name: string;
  province_region: string;
  representative_name: string;
  capability_profile?: string | null;
  u20_athlete_list?: string | null;
}

export async function findApprovedClubs(
  provinceRegion?: string
): Promise<ClubRow[]> {
  if (provinceRegion) {
    return query<ClubRow>(
      `SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list
       FROM clubs_club
       WHERE is_approved = true AND province_region = $1
       ORDER BY id ASC`,
      [provinceRegion]
    );
  }
  return query<ClubRow>(
    `SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list
     FROM clubs_club
     WHERE is_approved = true
     ORDER BY id ASC`
  );
}

export async function findApprovedClubById(
  id: number
): Promise<ClubRow | null> {
  return queryOne<ClubRow>(
    `SELECT id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list
     FROM clubs_club
     WHERE id = $1 AND is_approved = true`,
    [id]
  );
}

export async function findPlayersByClubId(
  clubId: number
): Promise<PlayerRow[]> {
  return query<PlayerRow>(
    `SELECT id, club_id, name
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
    `SELECT id, club_id, name
     FROM players_coachstaff
     WHERE club_id = $1
     ORDER BY id ASC`,
    [clubId]
  );
}

export async function createClub(
  params: CreateClubParams
): Promise<ClubRow> {
  const rows = await query<ClubRow>(
    `INSERT INTO clubs_club (name, province_region, representative_name, capability_profile, u20_athlete_list, is_approved)
     VALUES ($1, $2, $3, $4, $5, false)
     RETURNING id, name, logo, founding_year, achievements, province_region, contact_info, social_links, is_approved, representative_name, capability_profile, u20_athlete_list`,
    [
      params.name,
      params.province_region,
      params.representative_name,
      params.capability_profile || null,
      params.u20_athlete_list || null,
    ]
  );
  return rows[0];
}
