import React from "react";
import { render, screen } from "@testing-library/react";
import { TournamentSystemSection } from "./TournamentSystemSection";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("TournamentSystemSection", () => {
  it("renders correctly", async () => {
    const ui = await TournamentSystemSection();
    render(ui);
    expect(screen.getByRole("heading", { name: "heading" })).toBeInTheDocument();
    expect(screen.getByText("intro")).toBeInTheDocument();
    expect(screen.getByText("disclaimer")).toBeInTheDocument();
  });
});
