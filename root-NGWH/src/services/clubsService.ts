import type {
  Club,
  ClubDetail,
  ClubRegistrationFieldErrors,
  ClubRegistrationResult,
} from "@/types/club";

// API client calling Next.js Route Handlers.
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

interface GetClubsParams {
  provinceRegion?: string;
}

/** REQ-CLUB-001 (list slice)/REQ-CLUB-002 (region filter). */
export async function getClubs(params: GetClubsParams = {}): Promise<Club[]> {
  const url = new URL("/api/clubs/", API_BASE_URL);
  if (params.provinceRegion) {
    url.searchParams.set("province_region", params.provinceRegion);
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch clubs: ${response.status}`);
  }

  return response.json();
}

/**
 * REQ-CLUB-003 (display gate)/004/005/006: Club Profile
 * (.ai/lld/club-profile.md §14). A 404 means "not found or not yet
 * approved" — both are indistinguishable per BR-001, so this resolves to
 * `null` rather than throwing; the page calls Next's `notFound()` for
 * that case. Any other non-OK status is a genuine failure and throws, so
 * the page renders `ErrorMessage` instead.
 */
export async function getClubById(id: string | number): Promise<ClubDetail | null> {
  const url = new URL(`/api/clubs/${id}/`, API_BASE_URL);

  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch club ${id}: ${response.status}`);
  }

  return response.json();
}

export type RegisterClubResult =
  | { ok: true; club: ClubRegistrationResult }
  | { ok: false; fieldErrors: ClubRegistrationFieldErrors }
  | { ok: false; networkError: true };

/**
 * REQ-REG-001/002/003: Club Registration (.ai/lld/club-registration.md
 * §8/§10). `formData` is forwarded to API Route Handlers unmodified — fetch sets the
 * multipart boundary itself, no manual encoding. `201` → success echo;
 * `400` → DRF's own per-field validation messages, passed through
 * as-is (no translated backend validation copy is authored here); any
 * other outcome (network failure, unexpected status) → `networkError`,
 * so the page renders the shared `ErrorMessage`.
 */
export async function registerClub(formData: FormData): Promise<RegisterClubResult> {
  const url = new URL("/api/clubs/", API_BASE_URL);

  let response: Response;
  try {
    response = await fetch(url, { method: "POST", body: formData });
  } catch {
    return { ok: false, networkError: true };
  }

  if (response.status === 201) {
    const club: ClubRegistrationResult = await response.json();
    return { ok: true, club };
  }
  if (response.status === 400) {
    const fieldErrors: ClubRegistrationFieldErrors = await response.json();
    return { ok: false, fieldErrors };
  }
  return { ok: false, networkError: true };
}
