// Tournament/Match data shapes — Sprint 4 (.ai/lld/tournaments.md §6/§8).
// Mirror the DRF MatchSerializer/SeasonSerializer payloads exactly.

export interface MatchClub {
  id: number;
  name: string;
  logo: string | null;
}

export type MatchStatus = "scheduled" | "completed" | "postponed";

export interface Match {
  id: number;
  scheduled_at: string;
  venue: string | null;
  status: MatchStatus;
  home_club: MatchClub;
  away_club: MatchClub;
}

export interface Season {
  id: number;
  year: number;
}
