export interface ClubRow {
  id: number;
  name: string;
  logo: string | null;
  founding_year: number | null;
  achievements: unknown | null;
  province_region: string;
  contact_info: unknown | null;
  social_links: unknown | null;
  is_approved: boolean;
  representative_name: string;
  capability_profile: string | null;
  u20_athlete_list: string | null;
}

export interface PlayerRow {
  id: number;
  club_id: number;
  name: string;
}

export interface CoachStaffRow {
  id: number;
  club_id: number;
  name: string;
}

export interface TournamentRow {
  id: number;
  name: string;
}

export interface SeasonRow {
  id: number;
  tournament_id: number;
  year: number;
}

export interface MatchRow {
  id: number;
  season_id: number;
  home_club_id: number;
  away_club_id: number;
  scheduled_at: Date;
  venue: string | null;
  status: string;
}
