import { query } from "@/server/db/client";

export interface DashboardMetrics {
  totalClubs: number;
  pendingApprovals: number;
  totalSeasons: number;
  totalMatches: number;
  heroSlides: number;
}

export async function getAdminDashboardMetrics(): Promise<DashboardMetrics> {
  let totalClubs = 0;
  let pendingApprovals = 0;
  let totalSeasons = 0;
  let totalMatches = 0;
  let heroSlides = 0;

  try {
    const clubsRes = await query<{ count: string }>(
      "SELECT COUNT(*) FROM clubs_club"
    );
    totalClubs = parseInt(clubsRes[0]?.count || "0", 10);
  } catch {}

  try {
    const pendingRes = await query<{ count: string }>(
      "SELECT COUNT(*) FROM clubs_club WHERE is_approved = false"
    );
    pendingApprovals = parseInt(pendingRes[0]?.count || "0", 10);
  } catch {}

  try {
    const seasonsRes = await query<{ count: string }>(
      "SELECT COUNT(*) FROM tournaments_season"
    );
    totalSeasons = parseInt(seasonsRes[0]?.count || "0", 10);
  } catch {}

  try {
    const matchesRes = await query<{ count: string }>(
      "SELECT COUNT(*) FROM matches_match"
    );
    totalMatches = parseInt(matchesRes[0]?.count || "0", 10);
  } catch {}

  try {
    const heroRes = await query<{ count: string }>(
      "SELECT COUNT(*) FROM hero_slides"
    );
    heroSlides = parseInt(heroRes[0]?.count || "0", 10);
  } catch {}

  return {
    totalClubs,
    pendingApprovals,
    totalSeasons,
    totalMatches,
    heroSlides,
  };
}
