/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { HotNewsList } from "./HotNewsList";
import * as contentService from "../../../../services/contentService";

// Mock next-intl/server
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

// Mock ArticleCard to avoid rendering complex dependencies
jest.mock("../../news/ArticleCard/ArticleCard", () => ({
  ArticleCard: ({ article }: { article: any }) => <div data-testid="article-card">{article.title.en}</div>,
}));

// Spy on service
jest.mock("../../../../services/contentService");

describe("HotNewsList", () => {
  it("renders grid when there is news", async () => {
    (contentService.getHotNews as jest.Mock).mockReturnValue([
      { id: "1", title: { en: "News 1", vi: "Tin 1" }, slug: "news-1" },
      { id: "2", title: { en: "News 2", vi: "Tin 2" }, slug: "news-2" },
    ]);
    
    // Async server component rendering in test requires resolving
    const ui = await HotNewsList();
    render(ui);
    
    expect(screen.getByText("heading")).toBeInTheDocument();
    expect(screen.getByText("viewAll")).toBeInTheDocument();
    expect(screen.getAllByTestId("article-card")).toHaveLength(2);
  });

  it("renders empty state", async () => {
    (contentService.getHotNews as jest.Mock).mockReturnValue([]);
    
    const ui = await HotNewsList();
    render(ui);
    
    expect(screen.getByText("empty")).toBeInTheDocument();
    expect(screen.queryByText("viewAll")).not.toBeInTheDocument();
  });

  it("renders error state when service throws", async () => {
    (contentService.getHotNews as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    
    const ui = await HotNewsList();
    render(ui);
    
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
