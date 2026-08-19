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
}

export async function findAllMatchesWithClubs(): Promise<MatchWithClubsRow[]> {
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
       ac.logo AS away_club_logo
     FROM matches_match m
     JOIN clubs_club hc ON m.home_club_id = hc.id
     JOIN clubs_club ac ON m.away_club_id = ac.id
     ORDER BY m.scheduled_at ASC`
  );
}
