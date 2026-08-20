// Club Directory data shape — Sprint 2 Batch 3 (.ai/lld/club-directory.md
// §16/§17). Mirrors the DRF `ClubListSerializer` payload exactly: list-view
// fields only (no `contact_info`/`social_links` — Profile-scoped, not
// requested by this page's API call).

export interface Club {
  id: number;
  name: string;
  logo: string | null;
  founding_year: number | null;
  /** Shape not confirmed (.ai/lld/clubs.md §12) — rendered as-is, no locale-switching. */
  achievements: unknown;
  province_region: string;
}

// Club Profile data shape — Sprint 2 Batch 4 (.ai/lld/club-profile.md
// §14). Mirrors the DRF `ClubDetailSerializer` payload: the Directory's
// list-view fields plus contact_info/social_links and the nested
// roster/coaching-staff lists (names only, matching the implemented
// Player/CoachStaff models).

export interface ClubRosterMember {
  id: number;
  name: string;
}

export interface ClubDetail extends Club {
  /** Shape not confirmed (.ai/lld/clubs.md §12) — rendered defensively, no locale-switching. */
  contact_info: unknown;
  /** Shape not confirmed (.ai/lld/clubs.md §12) — rendered defensively, no locale-switching. */
  social_links: unknown;
  capability_profile?: string | null;
  u20_athlete_list?: string | null;
  players: ClubRosterMember[];
  coach_staff: ClubRosterMember[];
  user_id?: number | null;
}

export interface ClubPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedClubsResponse {
  data: Club[];
  pagination: ClubPagination;
}

// Club Registration data shape — Sprint 3 (.ai/lld/club-registration.md
// §8). Mirrors the DRF `ClubRegistrationSerializer` payload — never
// `is_approved` (not a field on that serializer at all).

export interface ClubRegistrationResult {
  id: number;
  name: string;
  province_region: string;
  representative_name: string;
  logo: string | null;
  capability_profile: string | null;
  u20_athlete_list: string | null;
}

/** DRF's standard 400 validation-error shape: `{"<field>": ["message", ...]}`. */
export interface ClubRegistrationFieldErrors {
  [field: string]: string[];
}
