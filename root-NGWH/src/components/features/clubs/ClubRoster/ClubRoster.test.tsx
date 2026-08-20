import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubRoster } from "./ClubRoster";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("ClubRoster", () => {
  it("renders empty state", async () => {
    const ui = await ClubRoster({ players: [] });
    render(ui);
    expect(screen.getByText("roster.empty")).toBeInTheDocument();
  });

  it("renders list of players", async () => {
    const ui = await ClubRoster({
      players: [
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
      ],
    });
    render(ui);
    expect(screen.getAllByText("Player 1")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Player 2")[0]).toBeInTheDocument();
  });
});
