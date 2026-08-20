import type {
  ClubDetail,
  ClubPagination,
  ClubRegistrationFieldErrors,
  ClubRegistrationResult,
  PaginatedClubsResponse,
} from "@/types/club";

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

export interface GetClubsParams {
  provinceRegion?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** REQ-CLUB-001 (list slice)/REQ-CLUB-002 (region filter). */
export async function getClubs(params: GetClubsParams = {}): Promise<PaginatedClubsResponse> {
  const urlObj = buildUrl("/api/clubs");
  if (params.provinceRegion) {
    urlObj.searchParams.set("province_region", params.provinceRegion);
  }
  if (params.search) {
    urlObj.searchParams.set("search", params.search);
  }
  if (params.page !== undefined) {
    urlObj.searchParams.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    urlObj.searchParams.set("limit", String(params.limit));
  }

  const response = await fetch(urlObj, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch clubs: ${response.status}`);
  }

  const json = await response.json();
  if (Array.isArray(json)) {
    return {
      data: json,
      pagination: {
        page: 1,
        limit: json.length || 9,
        total: json.length,
        totalPages: 1,
      },
    };
  }
  return json;
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
  const url = buildUrl(`/api/clubs/${id}`);

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
  | { ok: false; status: number; message?: string }
  | { ok: false; networkError: true };

/**
 * REQ-REG-001/002/003: Club Registration (.ai/lld/club-registration.md
 * §8/§10). `formData` is forwarded to API Route Handlers unmodified — fetch sets the
 * multipart boundary itself, no manual encoding. `201` → success echo;
 * `400` → DRF's own per-field validation messages; other HTTP statuses → log status,
 * network errors → networkError: true.
 */
export async function registerClub(formData: FormData): Promise<RegisterClubResult> {
  const url = buildUrl("/api/clubs");

  let response: Response;
  try {
    response = await fetch(url, { method: "POST", body: formData });
  } catch (error) {
    console.error("registerClub fetch failed:", error);
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

  console.error(`registerClub HTTP error status ${response.status}: ${response.statusText}`);
  return { ok: false, status: response.status, message: response.statusText };
}
