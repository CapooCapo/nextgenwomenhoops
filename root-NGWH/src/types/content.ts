// Shared content types — News content model (SPRINT_PLAN.md Sprint 1
// Technical Prerequisite) and the standalone Champions Corner editorial
// record (see .ai/lld/home.md §15 and .ai/lld/news.md §Data requirements).
//
// These are fixture-backed for Sprint 1 (no Django backend exists yet —
// ARCHITECTURE.md §9). Reads go through src/services/contentService.ts only;
// components never import fixtures directly.

export interface LocalizedText {
  en: string;
  vi: string;
}

export type NewsCategory =
  | "tournament_news" // REQ-NEWS-001
  | "inspirational" // REQ-NEWS-002
  | "knowledge_nutrition"; // REQ-NEWS-003

export interface NewsArticle {
  id: string;
  slug: string;
  category: NewsCategory;
  /** ISO 8601 date string. */
  publishedAt: string;
  title: LocalizedText;
  /** Presentational necessity for card display — not a requirement-specified field (.ai/lld/news.md). */
  summary?: LocalizedText;
  body: LocalizedText;
  /** Optional — cards degrade to text-only when absent. */
  coverImage?: {
    src: string;
    alt: LocalizedText;
  };
}

export interface Champion {
  seasonLabel: LocalizedText;
  clubName: LocalizedText;
  blurb: LocalizedText;
  photo?: {
    src: string;
    alt: LocalizedText;
  };
}

export interface Partner {
  name: LocalizedText;
  role: LocalizedText; // e.g. "Organizing Committee" / "Partner"
  logo?: {
    src: string;
    alt: LocalizedText;
  };
}

export interface MvpSpotlight {
  seasonLabel: LocalizedText;
  playerName: LocalizedText;
  clubName: LocalizedText;
  blurb: LocalizedText;
  photo?: {
    src: string;
    alt: LocalizedText;
  };
}

export interface BehindScenesStory {
  title: LocalizedText;
  body: LocalizedText;
  photo?: {
    src: string;
    alt: LocalizedText;
  };
}

/**
 * REQ-CONTACT-001 (.ai/lld/contact.md §3). `officeAddress`/`hotline` are
 * plain strings, not `LocalizedText` — same precedent as `Club.name`/
 * `province_region`: client-authored business data is stored once,
 * displayed as-is, not translated per locale. `supportEmails[].label` IS
 * `LocalizedText` since it's UI-authored categorization ("Professional
 * Support" / "Sponsorship Cooperation"), not client business data.
 */
export interface ContactInfo {
  officeAddress?: LocalizedText | string;
  hotline?: LocalizedText | string;
  supportEmails?: Array<{ label: LocalizedText; email: LocalizedText | string }>;
}
