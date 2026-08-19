import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

// Mock next-intl hooks
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock LanguageSwitcher
jest.mock("../LanguageSwitcher/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Lang</div>,
}));

describe("SiteHeader", () => {
  it("renders brand, navigation links, and actions", () => {
    render(<SiteHeader />);
    expect(screen.getByText("NextGen Women Hoops")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getAllByText("home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("about").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("language-switcher").length).toBeGreaterThan(0);
  });

  it("toggles mobile navigation menu when menu button is clicked", () => {
    render(<SiteHeader />);
    const toggleButton = screen.getByRole("button", { name: "openMenu" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleButton);
    expect(screen.getByRole("button", { name: "closeMenu" })).toHaveAttribute("aria-expanded", "true");

    const mobileNav = screen.getByRole("navigation", { name: "Mobile navigation" });
    expect(mobileNav).toBeInTheDocument();

    const homeLinks = screen.getAllByText("home");
    fireEvent.click(homeLinks[homeLinks.length - 1]);
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("updates scrolled class when page is scrolled beyond threshold", () => {
    render(<SiteHeader />);
    const header = screen.getByRole("banner");

    expect(header).not.toHaveClass("scrolled");

    // Simulate scroll down past threshold (20px)
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 50, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    expect(header.className).toContain("scrolled");

    // Simulate scroll back to top
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    expect(header.className).not.toContain("scrolled");
  });

  it("opens mobile navigation menu when scrolled down", () => {
    render(<SiteHeader />);
    const header = screen.getByRole("banner");

    // Scroll down 300px
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 300, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    expect(header.className).toContain("scrolled");

    const toggleButton = screen.getByRole("button", { name: "openMenu" });
    fireEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument();
  });
});
