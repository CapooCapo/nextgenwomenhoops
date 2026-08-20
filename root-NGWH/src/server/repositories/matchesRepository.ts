import { query } from "../db/client";

export interface MatchWithClubsRow {
  id: number;
  scheduled_at: string;
  venue: string | null;
  status: string;
  home_club_id: number;
  home_club_name: string;
  home_club_logo: string | null;
  away_club_id: number;
  away_club_name: string;
  away_club_logo: string | null;
  home_score?: number | null;
  away_score?: number | null;
  home_fouls?: number | null;
  away_fouls?: number | null;
  timer?: string | null;
  period?: string | null;
}

let columnsEnsured = false;

async function ensureMatchesColumns(): Promise<void> {
  if (columnsEnsured) return;
  try {
    await query(`
      ALTER TABLE matches_match 
      ADD COLUMN IF NOT EXISTS home_score INTEGER,
      ADD COLUMN IF NOT EXISTS away_score INTEGER,
      ADD COLUMN IF NOT EXISTS home_fouls INTEGER,
      ADD COLUMN IF NOT EXISTS away_fouls INTEGER,
      ADD COLUMN IF NOT EXISTS timer VARCHAR(50),
      ADD COLUMN IF NOT EXISTS period VARCHAR(50);
    `);
    columnsEnsured = true;
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Failed to ensure matches_match columns:", err);
    }
  }
}

export async function findAllMatchesWithClubs(): Promise<MatchWithClubsRow[]> {
  await ensureMatchesColumns();
  return query<MatchWithClubsRow>(
    `SELECT 
       m.id,
       m.scheduled_at,
       m.venue,
       m.status,
       hc.id AS home_club_id,
       hc.name AS home_club_name,
       hc.logo AS home_club_logo,
       ac.id AS away_club_id,
       ac.name AS away_club_name,
       ac.logo AS away_club_logo,
       m.home_score,
       m.away_score,
       m.home_fouls,
       m.away_fouls,
       m.timer,
       m.period
     FROM matches_match m
     JOIN clubs_club hc ON m.home_club_id = hc.id
     JOIN clubs_club ac ON m.away_club_id = ac.id
     ORDER BY m.scheduled_at ASC`
  );
}
