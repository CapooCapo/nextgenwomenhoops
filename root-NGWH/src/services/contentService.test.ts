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

describe("contentService", () => {
  describe("getHotNews", () => {
    it("returns items sorted by publishedAt descending", () => {
      const articles = getHotNews(5);
      const dates = articles.map((a) => a.publishedAt);
      const sorted = [...dates].sort().reverse();
      expect(dates).toEqual(sorted);
    });

    it("respects the maxCount slice", () => {
      expect(getHotNews(2)).toHaveLength(2);
    });

    it("returns between 3 and 5 items for the default fixture set (BR-002)", () => {
      const articles = getHotNews(5);
      expect(articles.length).toBeGreaterThanOrEqual(3);
      expect(articles.length).toBeLessThanOrEqual(5);
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
    it("returns only articles in the requested category", () => {
      const articles = getNewsByCategory("tournament_news");
      expect(articles.length).toBeGreaterThan(0);
      expect(
        articles.every((a) => a.category === "tournament_news"),
      ).toBe(true);
    });

    it("returns items sorted by publishedAt descending", () => {
      const articles = getNewsByCategory("tournament_news");
      const dates = articles.map((a) => a.publishedAt);
      const sorted = [...dates].sort().reverse();
      expect(dates).toEqual(sorted);
    });

    it("applies no count limit (unlike getHotNews)", () => {
      expect(getNewsByCategory("tournament_news")).toHaveLength(2);
    });
  });

  describe("getArticleBySlug", () => {
    it("finds an article by its slug", () => {
      const article = getArticleBySlug("2026-championship-kickoff-announcement");
      expect(article?.title.en).toBe("2026 NextGen Women Hoops Championship Kicks Off This Summer");
    });

    it("returns undefined for an unknown slug", () => {
      expect(getArticleBySlug("does-not-exist")).toBeUndefined();
    });
  });

  describe("getPartners", () => {
    it("returns an empty array when no committee/partner entry is confirmed", () => {
      expect(getPartners()).toEqual([]);
    });
  });

  describe("getChampionshipPhotos", () => {
    it("returns an empty array when no photo is confirmed", () => {
      expect(getChampionshipPhotos()).toEqual([]);
    });
  });

  describe("getMvpSpotlight", () => {
    it("returns null when no MVP record is confirmed", () => {
      expect(getMvpSpotlight()).toBeNull();
    });
  });

  describe("getBehindScenesStories", () => {
    it("returns an empty array when no story is confirmed", () => {
      expect(getBehindScenesStories()).toEqual([]);
    });
  });
});
