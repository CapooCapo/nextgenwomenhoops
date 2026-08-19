import React from "react";
import { render, screen } from "@testing-library/react";
import { PartnerCard } from "./PartnerCard";

jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

describe("PartnerCard", () => {
  it("renders with logo", () => {
    const partner = {
      name: { en: "Test Partner", vi: "Test Partner VI" },
      role: { en: "Partner", vi: "Đối tác" },
      logo: { src: "/test.png", alt: { en: "Logo", vi: "Logo" } }
    };
    render(<PartnerCard partner={partner} />);
    expect(screen.getByRole("img", { name: "Logo" })).toBeInTheDocument();
    expect(screen.getByText("Test Partner")).toBeInTheDocument();
    expect(screen.getByText("Partner")).toBeInTheDocument();
  });

  it("renders text only fallback", () => {
    const partner = {
      name: { en: "No Logo Partner", vi: "No Logo Partner VI" },
      role: { en: "Sponsor", vi: "Tài trợ" },
    };
    render(<PartnerCard partner={partner} />);
    expect(screen.getByText("No Logo Partner")).toBeInTheDocument();
    expect(screen.getByText("Sponsor")).toBeInTheDocument();
  });
});
