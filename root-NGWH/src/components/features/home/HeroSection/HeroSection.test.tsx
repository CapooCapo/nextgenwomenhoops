/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./HeroSection";

// Mock next-intl/server
jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

// Mock HeroCarousel
jest.mock("../HeroCarousel/HeroCarousel", () => ({
  HeroCarousel: (props: any) => <div data-testid="hero-carousel">{props.tagline}</div>,
}));

// Mock config
jest.mock("../../../../config/brandAssets", () => ({
  BRAND_ASSETS: { hero: { src: "/hero.jpg", height: 100, width: 100 } },
}));

describe("HeroSection", () => {
  it("renders the HeroCarousel with translations and brand config", async () => {
    const ui = await HeroSection();
    render(ui);
    expect(screen.getByTestId("hero-carousel")).toBeInTheDocument();
  });
});
