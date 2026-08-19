/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubDirectoryList } from "./ClubDirectoryList";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock("../ClubCard/ClubCard", () => ({
  ClubCard: ({ club }: { club: any }) => <div data-testid="club-card">{club.name}</div>,
}));

describe("ClubDirectoryList", () => {
  it("renders empty state", async () => {
    const ui = await ClubDirectoryList({ clubs: [] });
    render(ui);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders grid of clubs", async () => {
    const ui = await ClubDirectoryList({
      clubs: [
        { id: 1, name: "Club A" } as any,
        { id: 2, name: "Club B" } as any,
      ],
    });
    render(ui);
    expect(screen.getAllByTestId("club-card")).toHaveLength(2);
    expect(screen.getByText("Club A")).toBeInTheDocument();
    expect(screen.getByText("Club B")).toBeInTheDocument();
  });
});
