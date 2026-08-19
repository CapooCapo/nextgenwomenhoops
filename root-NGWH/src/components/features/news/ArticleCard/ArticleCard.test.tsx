import React from "react";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "./ArticleCard";

jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: () => "Jan 1, 2026",
  }),
}));

const mockArticle = {
  id: "1",
  slug: "test-article",
  category: "tournament_news" as const,
  publishedAt: "2026-01-01T00:00:00Z",
  title: { en: "Test Title", vi: "Tiêu đề" },
  summary: { en: "Test Summary", vi: "Test Summary VI" },
  body: { en: "Test Body", vi: "Test Body VI" },
};

describe("ArticleCard", () => {
  it("renders correctly without image", () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/news/test-article");
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Summary")).toBeInTheDocument();
    expect(screen.getByText("tournament_news")).toBeInTheDocument();
    expect(screen.getByText("Jan 1, 2026")).toBeInTheDocument();
  });
});
