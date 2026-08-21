/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubDirectoryList } from "./ClubDirectoryList";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("ClubDirectoryList", () => {
  it("renders empty state", async () => {
    const ui = await ClubDirectoryList({ clubs: [] });
    render(ui);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders table of clubs", async () => {
    const ui = await ClubDirectoryList({
      clubs: [
        { id: 1, name: "Club A", logo: null, founding_year: 2020, achievements: null, province_region: "North" } as any,
        { id: 2, name: "Club B", logo: "/logo.png", founding_year: null, achievements: null, province_region: "South" } as any,
      ],
    });
    render(ui);
    
    // Check that table headers are rendered
    expect(screen.getByText("tableHeaders.name")).toBeInTheDocument();
    
    // Check that club names are in the document
    expect(screen.getByText("Club A")).toBeInTheDocument();
    expect(screen.getByText("Club B")).toBeInTheDocument();
    
    // Check that region is rendered
    expect(screen.getByText("North")).toBeInTheDocument();
    
    // Check that fallback is used when no founding year
    const fallbacks = screen.getAllByText("-");
    expect(fallbacks.length).toBeGreaterThan(0);
  });
});
