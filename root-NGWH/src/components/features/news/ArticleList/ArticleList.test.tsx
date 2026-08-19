/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { ArticleList } from "./ArticleList";
import * as contentService from "../../../../services/contentService";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock("../ArticleCard/ArticleCard", () => ({
  ArticleCard: ({ article }: { article: any }) => <div data-testid="article-card">{article.title.en}</div>,
}));

jest.mock("../../../../services/contentService");

describe("ArticleList", () => {
  it("renders empty state", async () => {
    (contentService.getNewsByCategory as jest.Mock).mockReturnValue([]);
    const ui = await ArticleList({ category: "tournament_news" });
    render(ui);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders articles grid", async () => {
    (contentService.getNewsByCategory as jest.Mock).mockReturnValue([
      { id: "1", title: { en: "Article 1" } },
      { id: "2", title: { en: "Article 2" } },
    ]);
    const ui = await ArticleList({ category: "inspirational" });
    render(ui);
    expect(screen.getAllByTestId("article-card")).toHaveLength(2);
  });

  it("renders error state", async () => {
    (contentService.getNewsByCategory as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    const ui = await ArticleList({ category: "knowledge_nutrition" });
    render(ui);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
