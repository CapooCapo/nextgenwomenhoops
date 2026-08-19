import type { Match, Season } from "@/types/tournament";

// API client calling Next.js Route Handlers.
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

/** REQ-TOURN-001. Ordering comes from the backend (Match.Meta.ordering). */
export async function getMatches(): Promise<Match[]> {
  const url = new URL("/api/matches/", API_BASE_URL);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.status}`);
  }

  return response.json();
}

/** REQ-TOURN-004. Ordering comes from the backend (Season.Meta.ordering). */
export async function getSeasons(): Promise<Season[]> {
  const url = new URL("/api/seasons/", API_BASE_URL);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch seasons: ${response.status}`);
  }

  return response.json();
}
