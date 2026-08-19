import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubContactSection } from "./ClubContactSection";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("ClubContactSection", () => {
  it("renders empty state for both", async () => {
    const ui = await ClubContactSection({ contactInfo: null, socialLinks: null });
    render(ui);
    expect(screen.getByText("contact.contactEmpty")).toBeInTheDocument();
    expect(screen.getByText("contact.socialEmpty")).toBeInTheDocument();
  });

  it("renders text info and url links", async () => {
    const ui = await ClubContactSection({
      contactInfo: "Phone: 123",
      socialLinks: ["https://facebook.com", "Twitter"],
    });
    render(ui);
    expect(screen.getByText("Phone: 123")).toBeInTheDocument();
    
    const link = screen.getByRole("link", { name: "https://facebook.com" });
    expect(link).toHaveAttribute("href", "https://facebook.com");
    expect(screen.getByText("Twitter")).toBeInTheDocument();
  });
});
