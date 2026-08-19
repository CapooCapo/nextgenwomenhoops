import { query } from "../db/client";
import { SeasonRow } from "../db/types";

export async function findAllSeasons(): Promise<SeasonRow[]> {
  return query<SeasonRow>(
    `SELECT id, tournament_id, year
     FROM tournaments_season
     ORDER BY year DESC`
  );
}
