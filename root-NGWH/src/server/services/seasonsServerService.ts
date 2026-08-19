import { findAllSeasons } from "../repositories/seasonsRepository";

export async function getSeasonsList() {
  const seasons = await findAllSeasons();
  return seasons.map((s) => ({
    id: s.id,
    year: s.year,
  }));
}
