import React from "react";
import { render, screen } from "@testing-library/react";
import { BrandStory } from "./BrandStory";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("BrandStory", () => {
  it("renders correctly", async () => {
    const ui = await BrandStory();
    render(ui);
    expect(screen.getByRole("heading", { name: "heading" })).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});
