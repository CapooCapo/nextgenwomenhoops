import React from "react";
import { render, screen } from "@testing-library/react";
import { ChampionsCorner } from "./ChampionsCorner";
import * as contentService from "../../../../services/contentService";

// Mock next-intl/server
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
  getLocale: jest.fn().mockResolvedValue("en"),
}));

// Spy on service
jest.mock("../../../../services/contentService");

describe("ChampionsCorner", () => {
  it("renders empty state", async () => {
    (contentService.getDefendingChampion as jest.Mock).mockReturnValue(null);
    const ui = await ChampionsCorner();
    render(ui);
    
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders champion data", async () => {
    (contentService.getDefendingChampion as jest.Mock).mockReturnValue({
      seasonLabel: { en: "2025 Season" },
      clubName: { en: "Team Alpha" },
      blurb: { en: "A great season." },
      photo: { src: "/photo.jpg", alt: { en: "Team photo" } }
    });
    
    const ui = await ChampionsCorner();
    render(ui);
    
    expect(screen.getByText("2025 Season")).toBeInTheDocument();
    expect(screen.getByText("Team Alpha")).toBeInTheDocument();
    expect(screen.getByText("A great season.")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    (contentService.getDefendingChampion as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    
    const ui = await ChampionsCorner();
    render(ui);
    
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
