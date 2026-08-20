import { render, screen } from "@testing-library/react";
import en from "../../../../../messages/en.json";
import { getMatchesList } from "@/server/services/matchesServerService";
import type { Match } from "@/types/tournament";
import { ScheduleTable } from "./ScheduleTable";

jest.mock("@/server/services/matchesServerService", () => ({
  getMatchesList: jest.fn(),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => {
    const value = key
      .split(".")
      .reduce<unknown>((obj, part) => (obj as Record<string, unknown>)?.[part], en);
    if (typeof value !== "string") {
      throw new Error(`Missing test translation for key: ${key}`);
    }
    return value;
  },
  getFormatter: async () => ({
    dateTime: (date: Date) => date.toISOString(),
  }),
}));

const mockedGetMatches = jest.mocked(getMatchesList);

const sampleMatch: Match = {
  id: 1,
  scheduled_at: "2026-06-01T10:00:00Z",
  venue: "District Sports Complex",
  status: "scheduled",
  home_club: { id: 1, name: "Hanoi Stars", logo: null },
  away_club: { id: 2, name: "Saigon Comets", logo: null },
};

describe("ScheduleTable", () => {
  beforeEach(() => {
    mockedGetMatches.mockReset();
  });

  it("renders the section heading", async () => {
    mockedGetMatches.mockResolvedValue([]);
    render(await ScheduleTable());
    expect(
      screen.getByRole("heading", { name: en.tournaments.schedule.heading }),
    ).toBeInTheDocument();
  });

  it("renders the empty state when there are no matches", async () => {
    mockedGetMatches.mockResolvedValue([]);
    render(await ScheduleTable());
    expect(screen.getByText(en.tournaments.schedule.empty)).toBeInTheDocument();
  });

  it("renders team names, venue, and translated status for each match", async () => {
    mockedGetMatches.mockResolvedValue([sampleMatch]);
    render(await ScheduleTable());

    expect(screen.getByText("Hanoi Stars")).toBeInTheDocument();
    expect(screen.getByText("Saigon Comets")).toBeInTheDocument();
    expect(screen.getByText("District Sports Complex")).toBeInTheDocument();
    expect(screen.getByText(en.tournaments.schedule.status.scheduled)).toBeInTheDocument();
  });

  it("omits the venue element when a match has none", async () => {
    mockedGetMatches.mockResolvedValue([{ ...sampleMatch, venue: null }]);
    render(await ScheduleTable());
    expect(screen.queryByText("District Sports Complex")).not.toBeInTheDocument();
  });

  it("renders ErrorMessage when the fetch fails", async () => {
    mockedGetMatches.mockRejectedValue(new Error("network error"));
    render(await ScheduleTable());
    expect(screen.getByRole("alert")).toHaveTextContent(en.tournaments.schedule.error);
    expect(screen.queryByText(en.tournaments.schedule.empty)).not.toBeInTheDocument();
  });
});
