import React from "react";
import { render, screen } from "@testing-library/react";
import { PartnersSection } from "./PartnersSection";
import * as contentService from "../../../../services/contentService";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock("../PartnerCard/PartnerCard", () => ({
  PartnerCard: ({ partner }: { partner: { name: { en: string } } }) => <div data-testid="partner-card">{partner.name.en}</div>,
}));

jest.mock("../../../../services/contentService");

describe("PartnersSection", () => {
  it("renders section with role cards and note", async () => {
    (contentService.getPartners as jest.Mock).mockReturnValue([]);
    const ui = await PartnersSection();
    render(ui);
    expect(screen.getByRole("heading", { name: "heading" })).toBeInTheDocument();
    expect(screen.getByText("intro")).toBeInTheDocument();
    expect(screen.getByText("note")).toBeInTheDocument();
  });

  it("renders partners grid when partners are returned", async () => {
    (contentService.getPartners as jest.Mock).mockReturnValue([
      { name: { en: "Partner 1" } },
      { name: { en: "Partner 2" } },
    ]);
    const ui = await PartnersSection();
    render(ui);
    expect(screen.getAllByTestId("partner-card")).toHaveLength(2);
  });

  it("renders error state", async () => {
    (contentService.getPartners as jest.Mock).mockImplementation(() => {
      throw new Error("Failed");
    });
    const ui = await PartnersSection();
    render(ui);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });
});
