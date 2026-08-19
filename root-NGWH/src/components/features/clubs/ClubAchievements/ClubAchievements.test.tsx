import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubAchievements } from "./ClubAchievements";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("ClubAchievements", () => {
  it("renders empty state when null", async () => {
    const ui = await ClubAchievements({ achievements: null });
    render(ui);
    expect(screen.getByText("achievements.empty")).toBeInTheDocument();
  });

  it("renders string correctly", async () => {
    const ui = await ClubAchievements({ achievements: "Champion 2021" });
    render(ui);
    expect(screen.getByText("Champion 2021")).toBeInTheDocument();
  });

  it("renders array of strings correctly", async () => {
    const ui = await ClubAchievements({ achievements: ["Champion 2021", "Runner up 2020"] });
    render(ui);
    expect(screen.getByText("Champion 2021")).toBeInTheDocument();
    expect(screen.getByText("Runner up 2020")).toBeInTheDocument();
  });
});
