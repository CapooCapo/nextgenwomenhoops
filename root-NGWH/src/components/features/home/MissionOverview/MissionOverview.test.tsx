import React from "react";
import { render, screen } from "@testing-library/react";
import { MissionOverview } from "./MissionOverview";

// Mock next-intl/server
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("MissionOverview", () => {
  it("renders translations correctly", async () => {
    const ui = await MissionOverview();
    render(ui);
    expect(screen.getByRole("heading", { name: "heading" })).toBeInTheDocument();
    expect(screen.getByText("paragraph1")).toBeInTheDocument();
    expect(screen.getByText("paragraph2")).toBeInTheDocument();
    expect(screen.getByText("paragraph3")).toBeInTheDocument();
    expect(screen.getByText("tagline")).toBeInTheDocument();
  });
});
