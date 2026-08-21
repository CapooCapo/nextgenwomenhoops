import {
  getArticleBySlug,
  getBehindScenesStories,
  getChampionshipPhotos,
  getDefendingChampion,
  getHotNews,
  getMvpSpotlight,
  getNewsByCategory,
  getPartners,
} from "./contentService";
import * as adminRepo from "@/server/repositories/adminContentRepository";

jest.mock("@/server/repositories/adminContentRepository", () => {
  const original = jest.requireActual("@/server/repositories/adminContentRepository");
  return {
    ...original,
    findAllNews: jest.fn().mockResolvedValue([]),
    findNewsByCategory: jest.fn().mockResolvedValue([]),
    findNewsBySlugOrId: jest.fn().mockResolvedValue(null),
  };
});

describe("contentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getHotNews", () => {
    it("returns items sorted by publishedAt descending", async () => {
      const articles = await getHotNews(5);
      const dates = articles.map((a) => a.publishedAt);
      const sorted = [...dates].sort().reverse();
      expect(dates).toEqual(sorted);
    });

    it("respects the maxCount slice", async () => {
      expect(await getHotNews(2)).toHaveLength(2);
    });

    it("returns between 3 and 5 items for the default fixture set (BR-002)", async () => {
      const articles = await getHotNews(5);
      expect(articles.length).toBeGreaterThanOrEqual(3);
      expect(articles.length).toBeLessThanOrEqual(5);
    });

    it("includes database articles when available", async () => {
      (adminRepo.findAllNews as jest.Mock).mockResolvedValueOnce([
        {
          id: 99,
          title: "NEWS_DB_PUBLIC_FLOW_TEST",
          category: "tournament_news",
          summary: "Test summary",
          content: "Test content",
          image_url: null,
          created_at: "2026-08-20T12:00:00.000Z",
        },
      ]);

      const articles = await getHotNews(5);
      expect(articles.some((a) => a.title.en === "NEWS_DB_PUBLIC_FLOW_TEST")).toBe(true);
    });
  });

  describe("getDefendingChampion", () => {
    it("returns defending champion record", () => {
      const champion = getDefendingChampion();
      expect(champion).not.toBeNull();
      expect(champion?.clubName.en).toBe("Hanoi Dragons Women's Basketball Club");
    });
  });

  describe("getNewsByCategory", () => {
    it("returns only articles in the requested category", async () => {
      const articles = await getNewsByCategory("tournament_news");
      expect(articles.length).toBeGreaterThan(0);
      expect(
        articles.every((a) => a.category === "tournament_news"),
      ).toBe(true);
    });

    it("returns items sorted by publishedAt descending", async () => {
      const articles = await getNewsByCategory("tournament_news");
      const dates = articles.map((a) => a.publishedAt);
      const sorted = [...dates].sort().reverse();
      expect(dates).toEqual(sorted);
    });

    it("applies no count limit (unlike getHotNews)", async () => {
      expect(await getNewsByCategory("tournament_news")).toHaveLength(2);
    });
  });

  describe("getArticleBySlug", () => {
    it("finds an article by its slug from fixtures", async () => {
      const article = await getArticleBySlug("2026-championship-kickoff-announcement");
      expect(article?.title.en).toBe("2026 NextGen Women Hoops Championship Kicks Off This Summer");
    });

    it("finds an article by slug from database", async () => {
      (adminRepo.findNewsBySlugOrId as jest.Mock).mockResolvedValueOnce({
        id: 99,
        title: "NEWS_DB_PUBLIC_FLOW_TEST",
        category: "tournament_news",
        summary: "Test summary",
        content: "Test content",
        image_url: null,
        created_at: "2026-08-20T12:00:00.000Z",
      });

      const article = await getArticleBySlug("99-news-db-public-flow-test");
      expect(article?.title.en).toBe("NEWS_DB_PUBLIC_FLOW_TEST");
    });

    it("returns undefined for an unknown slug", async () => {
      expect(await getArticleBySlug("does-not-exist")).toBeUndefined();
    });
  });

  describe("getPartners", () => {
    it("returns an empty array when no committee/partner entry is confirmed", () => {
      expect(getPartners()).toEqual([]);
    });
  });

  describe("getChampionshipPhotos", () => {
    it("returns championship photos fixture", () => {
      const photos = getChampionshipPhotos();
      expect(photos.length).toBe(4);
      expect(photos[0].src).toContain("/assets/gallery/championship/");
    });
  });

  describe("getMvpSpotlight", () => {
    it("returns mvp spotlight record", () => {
      const mvp = getMvpSpotlight();
      expect(mvp).not.toBeNull();
      expect(mvp?.playerName.en).toBe("Aisha Williams");
    });
  });

  describe("getBehindScenesStories", () => {
    it("returns behind-the-scenes stories fixture", () => {
      const stories = getBehindScenesStories();
      expect(stories.length).toBe(4);
      expect(stories[0].photo?.src).toContain("/assets/gallery/behind-the-scenes/");
    });
  });
});
