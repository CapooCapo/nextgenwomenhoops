import { findAllMatchesWithClubs } from "../repositories/matchesRepository";

export async function getMatchesList() {
  const matches = await findAllMatchesWithClubs();
  return matches.map((m) => ({
    id: m.id,
    scheduled_at: new Date(m.scheduled_at).toISOString(),
    venue: m.venue,
    status: m.status,
    home_club: {
      id: m.home_club_id,
      name: m.home_club_name,
      logo: m.home_club_logo,
    },
    away_club: {
      id: m.away_club_id,
      name: m.away_club_name,
      logo: m.away_club_logo,
    },
  }));
}
