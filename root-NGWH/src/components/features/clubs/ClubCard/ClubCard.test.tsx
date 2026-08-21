import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubCard } from "./ClubCard";
import { Club } from "../../../../types/club";

// Mock next-intl useTranslations
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const baseClub: Club = {
  id: 1,
  name: "Team A",
  logo: "/logo.png",
  founding_year: 2020,
  achievements: null,
  province_region: "North",
};

describe("ClubCard", () => {
  it("renders club data with logo and founding year", () => {
    render(<ClubCard club={baseClub} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/clubs/1");
    expect(screen.getByRole("heading", { name: "Team A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Team A" })).toBeInTheDocument();
    
    // Check table data
    expect(screen.getByText("foundingYear:")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
  });

  it("renders fallback logo and noFoundingYear text when year is missing", () => {
    const club: Club = { ...baseClub, id: 2, name: "Team B", logo: null, founding_year: null };
    render(<ClubCard club={club} />);

    expect(screen.getByText("T")).toBeInTheDocument(); // fallback initial
    expect(screen.getByText("Team B")).toBeInTheDocument();
    
    // Check table data for missing year
    expect(screen.getByText("foundingYear:")).toBeInTheDocument();
    expect(screen.getByText("noFoundingYear")).toBeInTheDocument();
  });
});
