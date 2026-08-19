import React from "react";
import { render, screen } from "@testing-library/react";
import { ClubCoachingStaff } from "./ClubCoachingStaff";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

describe("ClubCoachingStaff", () => {
  it("renders empty state", async () => {
    const ui = await ClubCoachingStaff({ coachStaff: [] });
    render(ui);
    expect(screen.getByText("coachingStaff.empty")).toBeInTheDocument();
  });

  it("renders list of coaching staff", async () => {
    const ui = await ClubCoachingStaff({
      coachStaff: [
        { id: 1, name: "Coach 1" },
        { id: 2, name: "Coach 2" },
      ],
    });
    render(ui);
    expect(screen.getByText("Coach 1")).toBeInTheDocument();
    expect(screen.getByText("Coach 2")).toBeInTheDocument();
  });
});
