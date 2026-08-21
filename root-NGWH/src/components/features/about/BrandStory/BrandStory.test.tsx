import React from "react";
import { render, screen } from "@testing-library/react";
import { BrandStory } from "./BrandStory";

jest.mock("next-intl/server", () => {
  const t = (key: string) => key;
  t.raw = (key: string) => {
    if (key === "missionPoints") return ["Mission Point 1", "Mission Point 2"];
    return key;
  };
  return {
    getTranslations: jest.fn().mockResolvedValue(t),
  };
});

describe("BrandStory", () => {
  it("renders correctly with vision and mission points", async () => {
    const ui = await BrandStory();
    render(ui);
    expect(screen.getByRole("heading", { name: "heading" })).toBeInTheDocument();
    expect(screen.getByText("visionText")).toBeInTheDocument();
    expect(screen.getByText("Mission Point 1")).toBeInTheDocument();
    expect(screen.getByText("Mission Point 2")).toBeInTheDocument();
  });
});
