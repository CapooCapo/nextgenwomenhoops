import React from "react";
import { render, screen } from "@testing-library/react";
import { ArticleDetail } from "./ArticleDetail";
import * as contentService from "../../../../services/contentService";
import { notFound } from "next/navigation";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
  getLocale: jest.fn().mockResolvedValue("en"),
  getFormatter: jest.fn().mockResolvedValue({
    dateTime: () => "January 1, 2026",
  }),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("../../../../services/contentService");

describe("ArticleDetail", () => {
  it("calls notFound when article does not exist", async () => {
    (contentService.getArticleBySlug as jest.Mock).mockReturnValue(undefined);
    await ArticleDetail({ slug: "non-existent" });
    expect(notFound).toHaveBeenCalled();
  });

  it("renders article data", async () => {
    (contentService.getArticleBySlug as jest.Mock).mockReturnValue({
      title: { en: "Test Article" },
      category: "tournament_news",
      publishedAt: "2026-01-01T00:00:00Z",
      body: { en: "Article body text." },
      coverImage: { src: "/cover.jpg", alt: { en: "Cover" } },
    });
    const ui = await ArticleDetail({ slug: "test-article" });
    render(ui);
    
    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("Article body text.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cover" })).toBeInTheDocument();
  });

  it("renders error state when service throws", async () => {
    (contentService.getArticleBySlug as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    const ui = await ArticleDetail({ slug: "error-article" });
    render(ui);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
