import { getMatchesList } from "./matchesServerService";
import * as matchesRepository from "../repositories/matchesRepository";

jest.mock("../repositories/matchesRepository");

describe("matchesServerService", () => {
  it("returns formatted list of matches with nested home and away clubs", async () => {
    const scheduledAt = new Date("2026-10-01T15:00:00Z");
    (matchesRepository.findAllMatchesWithClubs as jest.Mock).mockResolvedValue([
      {
        id: 1,
        scheduled_at: scheduledAt.toISOString(),
        venue: "Arena A",
        status: "scheduled",
        home_club_id: 10,
        home_club_name: "Home Team",
        home_club_logo: "/home.png",
        away_club_id: 20,
        away_club_name: "Away Team",
        away_club_logo: "/away.png",
      },
    ]);

    const result = await getMatchesList();
    expect(result).toEqual([
      {
        id: 1,
        scheduled_at: scheduledAt.toISOString(),
        venue: "Arena A",
        status: "scheduled",
        home_club: {
          id: 10,
          name: "Home Team",
          logo: "/home.png",
        },
        away_club: {
          id: 20,
          name: "Away Team",
          logo: "/away.png",
        },
      },
    ]);
  });
});
