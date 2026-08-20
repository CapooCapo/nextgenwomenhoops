import { query, queryOne } from "../db/client";
import { SeasonRow, MatchRow } from "../db/types";

export interface CreateSeasonParams {
  tournament_id?: number;
  year: number;
}

export interface CreateMatchParams {
  season_id: number;
  home_club_id: number;
  away_club_id: number;
  scheduled_at: string;
  venue?: string | null;
  status?: string;
  home_score?: number | null;
  away_score?: number | null;
  home_fouls?: number | null;
  away_fouls?: number | null;
  timer?: string | null;
  period?: string | null;
}

export async function createSeason(params: CreateSeasonParams): Promise<SeasonRow> {
  const tournamentId = params.tournament_id || 1;

  // Ensure default tournament exists if needed
  await query(
    `INSERT INTO tournaments_tournament (id, name)
     VALUES ($1, 'NextGen Women Hoops Championship')
     ON CONFLICT (id) DO NOTHING`,
    [tournamentId]
  );

  const rows = await query<SeasonRow>(
    `INSERT INTO tournaments_season (tournament_id, year)
     VALUES ($1, $2)
     RETURNING id, tournament_id, year`,
    [tournamentId, params.year]
  );
  return rows[0];
}

export async function deleteSeason(id: number): Promise<boolean> {
  const rows = await query(
    `DELETE FROM tournaments_season WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

export async function createMatch(params: CreateMatchParams): Promise<MatchRow> {
  const status = params.status || "scheduled";
  const rows = await query<MatchRow>(
    `INSERT INTO matches_match (season_id, home_club_id, away_club_id, scheduled_at, venue, status, home_score, away_score, home_fouls, away_fouls, timer, period)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id, season_id, home_club_id, away_club_id, scheduled_at, venue, status, home_score, away_score, home_fouls, away_fouls, timer, period`,
    [
      params.season_id,
      params.home_club_id,
      params.away_club_id,
      params.scheduled_at,
      params.venue || null,
      status,
      params.home_score ?? null,
      params.away_score ?? null,
      params.home_fouls ?? null,
      params.away_fouls ?? null,
      params.timer || null,
      params.period || null,
    ]
  );
  return rows[0];
}

export async function updateMatch(
  id: number,
  params: Partial<CreateMatchParams>
): Promise<MatchRow | null> {
  const existing = await queryOne<MatchRow>(
    `SELECT * FROM matches_match WHERE id = $1`,
    [id]
  );
  if (!existing) return null;

  const seasonId = params.season_id ?? existing.season_id;
  const homeId = params.home_club_id ?? existing.home_club_id;
  const awayId = params.away_club_id ?? existing.away_club_id;
  const scheduledAt = params.scheduled_at ?? existing.scheduled_at;
  const venue = params.venue !== undefined ? params.venue : existing.venue;
  const status = params.status ?? existing.status;
  const homeScore = params.home_score !== undefined ? params.home_score : existing.home_score;
  const awayScore = params.away_score !== undefined ? params.away_score : existing.away_score;
  const homeFouls = params.home_fouls !== undefined ? params.home_fouls : existing.home_fouls;
  const awayFouls = params.away_fouls !== undefined ? params.away_fouls : existing.away_fouls;
  const timer = params.timer !== undefined ? params.timer : existing.timer;
  const period = params.period !== undefined ? params.period : existing.period;

  const rows = await query<MatchRow>(
    `UPDATE matches_match
     SET season_id = $1, home_club_id = $2, away_club_id = $3, scheduled_at = $4, venue = $5, status = $6,
         home_score = $7, away_score = $8, home_fouls = $9, away_fouls = $10, timer = $11, period = $12
     WHERE id = $13
     RETURNING id, season_id, home_club_id, away_club_id, scheduled_at, venue, status, home_score, away_score, home_fouls, away_fouls, timer, period`,
    [
      seasonId,
      homeId,
      awayId,
      scheduledAt,
      venue,
      status,
      homeScore,
      awayScore,
      homeFouls,
      awayFouls,
      timer,
      period,
      id,
    ]
  );
  return rows[0];
}

export async function deleteMatch(id: number): Promise<boolean> {
  const rows = await query(
    `DELETE FROM matches_match WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows.length > 0;
}
