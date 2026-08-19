/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { BehindScenesSection } from "./BehindScenesSection";
import * as contentService from "../../../../services/contentService";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock("../BehindScenesEssay/BehindScenesEssay", () => ({
  BehindScenesEssay: ({ story }: { story: any }) => <div data-testid="story">{story.title.en}</div>,
}));

jest.mock("../../../../services/contentService");

describe("BehindScenesSection", () => {
  it("renders empty state", async () => {
    (contentService.getBehindScenesStories as jest.Mock).mockReturnValue([]);
    const ui = await BehindScenesSection();
    render(ui);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders stories grid", async () => {
    (contentService.getBehindScenesStories as jest.Mock).mockReturnValue([
      { title: { en: "Story 1" } },
      { title: { en: "Story 2" } },
    ]);
    const ui = await BehindScenesSection();
    render(ui);
    expect(screen.getAllByTestId("story")).toHaveLength(2);
  });

  it("renders error state", async () => {
    (contentService.getBehindScenesStories as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    const ui = await BehindScenesSection();
    render(ui);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
