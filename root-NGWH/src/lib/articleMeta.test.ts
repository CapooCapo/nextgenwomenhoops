import { formatArticleMeta } from "./articleMeta";
import type { NewsArticle } from "@/types/content";

const article: NewsArticle = {
  id: "1",
  slug: "sample-slug",
  category: "tournament_news",
  publishedAt: "2026-06-01T00:00:00.000Z",
  title: { en: "Sample", vi: "Mẫu" },
  body: { en: "Body", vi: "Nội dung" },
};

describe("formatArticleMeta", () => {
  it("returns the translated category label via the given t function", () => {
    const t = jest.fn((key: string) => `translated:${key}`);
    const { categoryLabel } = formatArticleMeta({
      article,
      t,
      formatDate: () => "",
    });

    expect(t).toHaveBeenCalledWith("news.categories.tournament_news");
    expect(categoryLabel).toBe("translated:news.categories.tournament_news");
  });

  it("formats publishedAt via the given formatDate function", () => {
    const formatDate = jest.fn(() => "Jun 1, 2026");
    const { formattedDate } = formatArticleMeta({
      article,
      t: (key) => key,
      formatDate,
    });

    expect(formatDate).toHaveBeenCalledWith(new Date(article.publishedAt));
    expect(formattedDate).toBe("Jun 1, 2026");
  });
});
