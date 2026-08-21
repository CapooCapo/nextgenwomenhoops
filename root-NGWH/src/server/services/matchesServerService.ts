import { findAllMatchesWithClubs } from "../repositories/matchesRepository";
import { normalizeMediaField as formatFileUrl } from "./clubMediaService";

export interface FormattedMatch {
  id: number;
  scheduled_at: string;
  venue: string | null;
  status: string;
  home_club: {
    id: number;
    name: string;
    logo: string | null;
    logoUrl?: string | null;
  };
  away_club: {
    id: number;
    name: string;
    logo: string | null;
    logoUrl?: string | null;
  };
  homeClub?: {
    id: number;
    name: string;
    logoUrl: string | null;
  };
  awayClub?: {
    id: number;
    name: string;
    logoUrl: string | null;
  };
  home_score?: number | null;
  away_score?: number | null;
  home_fouls?: number | null;
  away_fouls?: number | null;
  scoreHome?: number | null;
  scoreAway?: number | null;
  foulHome?: number | null;
  foulAway?: number | null;
  timer?: string | null;
  period?: string | null;
}

export async function getMatchesList(): Promise<FormattedMatch[]> {
  const matches = await findAllMatchesWithClubs();
  return matches.map((m) => {
    const formattedHomeLogo = formatFileUrl(m.home_club_logo);
    const formattedAwayLogo = formatFileUrl(m.away_club_logo);

    return {
      id: m.id,
      scheduled_at: new Date(m.scheduled_at).toISOString(),
      venue: m.venue,
      status: m.status,
      home_club: {
        id: m.home_club_id,
        name: m.home_club_name,
        logo: formattedHomeLogo,
        logoUrl: formattedHomeLogo,
      },
      away_club: {
        id: m.away_club_id,
        name: m.away_club_name,
        logo: formattedAwayLogo,
        logoUrl: formattedAwayLogo,
      },
      homeClub: {
        id: m.home_club_id,
        name: m.home_club_name,
        logoUrl: formattedHomeLogo,
      },
      awayClub: {
        id: m.away_club_id,
        name: m.away_club_name,
        logoUrl: formattedAwayLogo,
      },
      home_score: m.home_score ?? null,
      away_score: m.away_score ?? null,
      home_fouls: m.home_fouls ?? null,
      away_fouls: m.away_fouls ?? null,
      scoreHome: m.home_score ?? null,
      scoreAway: m.away_score ?? null,
      foulHome: m.home_fouls ?? null,
      foulAway: m.away_fouls ?? null,
      timer: m.timer ?? null,
      period: m.period ?? null,
    };
  });
}

export function selectHomepageLiveMatch(matches: FormattedMatch[]): FormattedMatch | null {
  if (!matches || matches.length === 0) {
    return null;
  }

  // Policy 1: Show currently live match first
  const liveMatch = matches.find(
    (m) => m.status.toLowerCase() === "live" || m.status.toLowerCase() === "in_progress"
  );
  if (liveMatch) {
    return liveMatch;
  }

  // Policy 2: Show most recently finished match
  const finishedMatches = matches
    .filter(
      (m) =>
        m.status.toLowerCase() === "finished" ||
        m.status.toLowerCase() === "completed" ||
        m.status.toLowerCase() === "ended"
    )
    .sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    );

  if (finishedMatches.length > 0) {
    return finishedMatches[0];
  }

  // Policy 3: If no live or finished match, show next upcoming scheduled match if present
  const scheduledMatches = matches
    .filter((m) => m.status.toLowerCase() === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

  if (scheduledMatches.length > 0) {
    return scheduledMatches[0];
  }

  return null;
}

export async function getHomepageLiveScoreboardMatch(): Promise<FormattedMatch | null> {
  const matches = await getMatchesList();
  return selectHomepageLiveMatch(matches);
}
