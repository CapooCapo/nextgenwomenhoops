import { query } from "../db/client";
import { PlayerRow, CoachStaffRow } from "../db/types";

export interface PlayerWithClubRow extends PlayerRow {
  club_name: string;
}

export interface CoachStaffWithClubRow extends CoachStaffRow {
  club_name: string;
}

export async function findAllPlayersAdmin(clubId?: number): Promise<PlayerWithClubRow[]> {
  const where = clubId ? "WHERE p.club_id = $1" : "";
  const params = clubId ? [clubId] : [];

  return query<PlayerWithClubRow>(
    `SELECT p.id, p.club_id, p.name, c.name AS club_name
     FROM players_player p
     JOIN clubs_club c ON p.club_id = c.id
     ${where}
     ORDER BY p.id DESC`,
    params
  );
}

export async function createPlayerAdmin(clubId: number, name: string): Promise<PlayerRow> {
  const rows = await query<PlayerRow>(
    `INSERT INTO players_player (club_id, name)
     VALUES ($1, $2)
     RETURNING id, club_id, name`,
    [clubId, name]
  );
  return rows[0];
}

export async function deletePlayerAdmin(id: number): Promise<boolean> {
  const rows = await query(`DELETE FROM players_player WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

export async function findAllCoachStaffAdmin(clubId?: number): Promise<CoachStaffWithClubRow[]> {
  const where = clubId ? "WHERE cs.club_id = $1" : "";
  const params = clubId ? [clubId] : [];

  return query<CoachStaffWithClubRow>(
    `SELECT cs.id, cs.club_id, cs.name, c.name AS club_name
     FROM players_coachstaff cs
     JOIN clubs_club c ON cs.club_id = c.id
     ${where}
     ORDER BY cs.id DESC`,
    params
  );
}

export async function createCoachStaffAdmin(clubId: number, name: string): Promise<CoachStaffRow> {
  const rows = await query<CoachStaffRow>(
    `INSERT INTO players_coachstaff (club_id, name)
     VALUES ($1, $2)
     RETURNING id, club_id, name`,
    [clubId, name]
  );
  return rows[0];
}

export async function deleteCoachStaffAdmin(id: number): Promise<boolean> {
  const rows = await query(`DELETE FROM players_coachstaff WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
