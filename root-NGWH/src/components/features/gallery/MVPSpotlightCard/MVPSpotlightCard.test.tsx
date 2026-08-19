import React from "react";
import { render, screen } from "@testing-library/react";
import { MVPSpotlightCard } from "./MVPSpotlightCard";
import * as contentService from "../../../../services/contentService";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
  getLocale: jest.fn().mockResolvedValue("en"),
}));

jest.mock("../PhotoThumbnail/PhotoThumbnail", () => ({
  PhotoThumbnail: () => <div data-testid="photo">Photo</div>,
}));

jest.mock("../../../../services/contentService");

describe("MVPSpotlightCard", () => {
  it("renders empty state", async () => {
    (contentService.getMvpSpotlight as jest.Mock).mockReturnValue(null);
    const ui = await MVPSpotlightCard();
    render(ui);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders mvp data", async () => {
    (contentService.getMvpSpotlight as jest.Mock).mockReturnValue({
      seasonLabel: { en: "2025" },
      playerName: { en: "Jane Doe" },
      clubName: { en: "Team Beta" },
      blurb: { en: "Great player." },
      photo: { src: "/jane.jpg", alt: { en: "Jane" } }
    });
    const ui = await MVPSpotlightCard();
    render(ui);
    
    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Team Beta")).toBeInTheDocument();
    expect(screen.getByText("Great player.")).toBeInTheDocument();
    expect(screen.getByTestId("photo")).toBeInTheDocument();
  });

  it("renders error state", async () => {
    (contentService.getMvpSpotlight as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    const ui = await MVPSpotlightCard();
    render(ui);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
