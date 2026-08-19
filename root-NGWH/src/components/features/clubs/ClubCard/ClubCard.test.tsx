import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubCard } from "./ClubCard";
import { Club } from "../../../../types/club";

describe("ClubCard", () => {
  it("renders club data with logo", () => {
    const club: Club = {
      id: 1,
      name: "Team A",
      logo: "/logo.png",
      founding_year: 2020,
      achievements: "Champion 2021",
      province_region: "North",
    };
    render(<ClubCard club={club} />);
    
    expect(screen.getByRole("link")).toHaveAttribute("href", "/clubs/1");
    expect(screen.getByRole("heading", { name: "Team A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Team A" })).toBeInTheDocument();
    expect(screen.getByText("North")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("Champion 2021")).toBeInTheDocument();
  });

  it("renders club data without logo", () => {
    const club: Club = {
      id: 2,
      name: "Team B",
      logo: null,
      founding_year: null,
      achievements: null,
      province_region: "South",
    };
    render(<ClubCard club={club} />);
    
    expect(screen.getByText("T")).toBeInTheDocument(); // Initial for Team B
    expect(screen.getByText("Team B")).toBeInTheDocument();
    expect(screen.getByText("South")).toBeInTheDocument();
    expect(screen.queryByText("2020")).not.toBeInTheDocument();
  });
});
