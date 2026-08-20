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
import {
  findAllNews,
  findNewsByCategory,
  findNewsBySlugOrId,
  mapNewsArticleRowToNewsArticle,
} from "@/server/repositories/adminContentRepository";

// Reads real PostgreSQL news data from adminContentRepository, with fixture fallback.

/** REQ-HOME-004 / BR-002: the 3-5 most recently published items. */
export async function getHotNews(maxCount = 5): Promise<NewsArticle[]> {
  try {
    const rows = await findAllNews();
    const dbArticles = rows.map(mapNewsArticleRowToNewsArticle);
    const combined = [...dbArticles, ...NEWS_FIXTURES];
    const uniqueMap = new Map<string, NewsArticle>();
    for (const art of combined) {
      if (!uniqueMap.has(art.id) && !uniqueMap.has(art.slug)) {
        uniqueMap.set(art.id, art);
      }
    }
    return Array.from(uniqueMap.values())
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, maxCount);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Error fetching hot news from database:", err);
    }
    return [...NEWS_FIXTURES]
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, maxCount);
  }
}

/** REQ-HOME-006: null until a real defending-champion record exists. */
export function getDefendingChampion(): Champion | null {
  return CHAMPION_FIXTURE;
}

/** REQ-NEWS-001/002/003: all of one category's articles, most recent first — no count limit (.ai/lld/news.md §4). */
export async function getNewsByCategory(category: NewsCategory): Promise<NewsArticle[]> {
  try {
    const rows = await findNewsByCategory(category);
    const dbArticles = rows.map(mapNewsArticleRowToNewsArticle);
    const fixtureCategory = NEWS_FIXTURES.filter((a) => a.category === category);
    const combined = [...dbArticles, ...fixtureCategory];
    const uniqueMap = new Map<string, NewsArticle>();
    for (const art of combined) {
      if (!uniqueMap.has(art.id) && !uniqueMap.has(art.slug)) {
        uniqueMap.set(art.id, art);
      }
    }
    return Array.from(uniqueMap.values()).sort(
      (a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Error fetching news by category from database:", err);
    }
    return NEWS_FIXTURES.filter((article) => article.category === category).sort(
      (a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)
    );
  }
}

/** News detail route lookup. */
export async function getArticleBySlug(slug: string): Promise<NewsArticle | undefined> {
  try {
    const dbRow = await findNewsBySlugOrId(slug);
    if (dbRow) {
      return mapNewsArticleRowToNewsArticle(dbRow);
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("Error fetching article by slug from database:", err);
    }
  }
  return NEWS_FIXTURES.find((article) => article.slug === slug || article.id === slug);
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
