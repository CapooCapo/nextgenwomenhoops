import type {
  BehindScenesStory,
  Champion,
  ContactInfo,
  LocalizedText,
  MvpSpotlight,
  NewsArticle,
  NewsCategory,
  Partner,
} from "@/types/content";
import { NEWS_FIXTURES } from "./fixtures/news";
import { CHAMPION_FIXTURE } from "./fixtures/champion";
import { PARTNERS_FIXTURE } from "./fixtures/partners";
import { CHAMPIONSHIP_PHOTOS_FIXTURE } from "./fixtures/championshipPhotos";
import { MVP_SPOTLIGHT_FIXTURE } from "./fixtures/mvpSpotlight";
import { BEHIND_SCENES_STORIES_FIXTURE } from "./fixtures/behindScenesStories";
import { CONTACT_INFO_FIXTURE } from "./fixtures/contactInfo";

// The only place that reads content fixtures (ARCHITECTURE.md §4 — mirrors
// the "services/" API-client layer reserved for real DRF calls). Sprint 1
// backs this with local fixtures since no Django backend is provisioned yet
// (ARCHITECTURE.md §9). When the backend lands, only these function bodies
// change to call DRF — callers are unaffected. See .ai/lld/home.md
// "Content hosting mechanism".

/** REQ-HOME-004 / BR-002: the 3-5 most recently published items. */
export function getHotNews(maxCount = 5): NewsArticle[] {
  return [...NEWS_FIXTURES]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, maxCount);
}

/** REQ-HOME-006: null until a real defending-champion record exists. */
export function getDefendingChampion(): Champion | null {
  return CHAMPION_FIXTURE;
}

/** REQ-NEWS-001/002/003: all of one category's articles, most recent first — no count limit (.ai/lld/news.md §4). */
export function getNewsByCategory(category: NewsCategory): NewsArticle[] {
  return NEWS_FIXTURES.filter((article) => article.category === category).sort(
    (a, b) => (a.publishedAt < b.publishedAt ? 1 : -1),
  );
}

/** News detail route lookup. */
export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_FIXTURES.find((article) => article.slug === slug);
}

/** REQ-ABOUT-003: empty until a real committee/partner entry exists. */
export function getPartners(): Partner[] {
  return PARTNERS_FIXTURE;
}

/** REQ-GALLERY-001 (photo slice): empty until a real photo exists. */
export function getChampionshipPhotos(): Array<{
  src: string;
  alt: LocalizedText;
}> {
  return CHAMPIONSHIP_PHOTOS_FIXTURE;
}

/** REQ-GALLERY-002: null until a real MVP record exists. */
export function getMvpSpotlight(): MvpSpotlight | null {
  return MVP_SPOTLIGHT_FIXTURE;
}

/** REQ-GALLERY-003: empty until a real story exists. */
export function getBehindScenesStories(): BehindScenesStory[] {
  return BEHIND_SCENES_STORIES_FIXTURE;
}

/** REQ-CONTACT-001: returns contact info fixture with placeholder layout data. */
export function getContactInfo(): ContactInfo | null {
  return CONTACT_INFO_FIXTURE;
}
