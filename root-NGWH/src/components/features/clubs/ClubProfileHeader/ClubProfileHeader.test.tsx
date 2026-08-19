import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubProfileHeader } from "./ClubProfileHeader";
import { ClubDetail } from "../../../../types/club";

describe("ClubProfileHeader", () => {
  const clubBase = {
    id: 1,
    name: "Team A",
    logo: "/logo.png",
    founding_year: 2020,
    achievements: null,
    province_region: "North",
    contact_info: null,
    social_links: null,
    players: [],
    coach_staff: [],
  };

  it("renders with logo", () => {
    render(<ClubProfileHeader club={clubBase} />);
    expect(screen.getByRole("heading", { name: "Team A" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Team A" })).toBeInTheDocument();
    expect(screen.getByText("North")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
  });

  it("renders without logo", () => {
    render(<ClubProfileHeader club={{ ...clubBase, logo: null, founding_year: null }} />);
    expect(screen.getByText("T")).toBeInTheDocument(); // Initial
    expect(screen.getByRole("heading", { name: "Team A" })).toBeInTheDocument();
    expect(screen.getByText("North")).toBeInTheDocument();
    expect(screen.queryByText("2020")).not.toBeInTheDocument();
  });
});
