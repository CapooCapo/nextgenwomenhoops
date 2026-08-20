import React from "react";
import { render, screen } from "@testing-library/react";
import { LiveScoreboard, renderFouls } from "./LiveScoreboard";
import * as matchesServerService from "../../../../server/services/matchesServerService";

import { getTranslations } from "next-intl/server";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn(),
  getLocale: jest.fn().mockResolvedValue("en"),
}));

jest.mock("../../../../server/services/matchesServerService");

describe("LiveScoreboard", () => {
  beforeEach(() => {
    (getTranslations as jest.Mock).mockResolvedValue((key: string) => key);
  });

  const mockLiveMatch: matchesServerService.FormattedMatch = {
    id: 10,
    scheduled_at: "2026-08-20T14:00:00Z",
    venue: "Main Stadium",
    status: "live",
    home_club: {
      id: 1,
      name: "Super Long Team Name Alpha Basketball Club",
      logo: "/logo-a.png",
    },
    away_club: {
      id: 2,
      name: "Team Beta",
      logo: null,
    },
    home_score: 65,
    away_score: 58,
    home_fouls: 3,
    away_fouls: 7, // Should clamp to 5
    timer: "03:45",
    period: "4th Quarter",
  };

  it("renders live match state correctly", async () => {
    const ui = await LiveScoreboard({ initialMatch: mockLiveMatch });
    render(ui);

    expect(screen.getAllByText("Super Long Team Name Alpha Basketball Club")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Team Beta")[0]).toBeInTheDocument();
    expect(screen.getAllByText("65")[0]).toBeInTheDocument();
    expect(screen.getAllByText("58")[0]).toBeInTheDocument();
    expect(screen.getByText("liveBadge")).toBeInTheDocument();
    expect(screen.getAllByText("03:45")[0]).toBeInTheDocument();
    expect(screen.getAllByText("4th Quarter")[0]).toBeInTheDocument();
  });

  it("renders finished match state correctly", async () => {
    const mockFinishedMatch: matchesServerService.FormattedMatch = {
      ...mockLiveMatch,
      status: "finished",
    };

    const ui = await LiveScoreboard({ initialMatch: mockFinishedMatch });
    render(ui);

    expect(screen.getAllByText("finalBadge")[0]).toBeInTheDocument();
    expect(screen.queryByText("liveBadge")).not.toBeInTheDocument();
  });

  it("renders ended match state correctly", async () => {
    const mockEndedMatch: matchesServerService.FormattedMatch = {
      ...mockLiveMatch,
      status: "ended",
    };

    const ui = await LiveScoreboard({ initialMatch: mockEndedMatch });
    render(ui);

    expect(screen.getAllByText("finalBadge")[0]).toBeInTheDocument();
    expect(screen.getAllByText("65")[0]).toBeInTheDocument();
    expect(screen.getAllByText("58")[0]).toBeInTheDocument();
    expect(screen.queryByText("liveBadge")).not.toBeInTheDocument();
  });

  it("renders empty state when no match is available", async () => {
    const ui = await LiveScoreboard({ initialMatch: null });
    render(ui);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders error state when error occurs", async () => {
    const ui = await LiveScoreboard({ forceError: true });
    render(ui);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("handles foul clamping correctly", () => {
    const { container: clampedHigh } = render(renderFouls(10, "FOULS")!);
    expect(clampedHigh.querySelectorAll("span.active")).toHaveLength(5);

    const { container: clampedLow } = render(renderFouls(-2, "FOULS")!);
    expect(clampedLow.querySelectorAll("span.active")).toHaveLength(0);

    expect(renderFouls(null, "FOULS")).toBeNull();
  });

  it("renders logo fallback initial when logo is null", async () => {
    const ui = await LiveScoreboard({ initialMatch: mockLiveMatch });
    render(ui);

    // Team Beta has logo null, so fallback initial 'T' is rendered
    expect(screen.getAllByText("T")[0]).toBeInTheDocument();
  });
});
