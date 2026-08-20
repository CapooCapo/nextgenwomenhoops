import type { Match, Season } from "@/types/tournament";

function getApiBaseUrl(): string {
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `http://127.0.0.1:${process.env.PORT || 3000}`
  );
}

function buildUrl(pathStr: string): URL {
  return new URL(pathStr, getApiBaseUrl());
}

/** REQ-TOURN-001. Ordering comes from the backend (Match.Meta.ordering). */
export async function getMatches(): Promise<Match[]> {
  const url = buildUrl("/api/matches");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch matches: ${response.status}`);
  }

  return response.json();
}

/** REQ-TOURN-004. Ordering comes from the backend (Season.Meta.ordering). */
export async function getSeasons(): Promise<Season[]> {
  const url = buildUrl("/api/seasons");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch seasons: ${response.status}`);
  }

  return response.json();
}
