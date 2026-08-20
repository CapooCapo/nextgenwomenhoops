import {
  getMatchesList,
  getHomepageLiveScoreboardMatch,
} from "./matchesServerService";
import * as matchesRepository from "../repositories/matchesRepository";

jest.mock("../repositories/matchesRepository");

describe("matchesServerService", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const mockRows: matchesRepository.MatchWithClubsRow[] = [
    {
      id: 1,
      scheduled_at: "2026-08-20T10:00:00Z",
      venue: "Main Court",
      status: "finished",
      home_club_id: 101,
      home_club_name: "Red Tigers",
      home_club_logo: "/tigers.png",
      away_club_id: 102,
      away_club_name: "Blue Eagles",
      away_club_logo: "/eagles.png",
      home_score: 75,
      away_score: 68,
      home_fouls: 4,
      away_fouls: 3,
      timer: "00:00",
      period: "4th Qtr",
    },
    {
      id: 2,
      scheduled_at: "2026-08-20T14:00:00Z",
      venue: "Arena 2",
      status: "live",
      home_club_id: 103,
      home_club_name: "Gold Dragons",
      home_club_logo: null,
      away_club_id: 104,
      away_club_name: "Silver Falcons",
      away_club_logo: "/falcons.png",
      home_score: 52,
      away_score: 48,
      home_fouls: 2,
      away_fouls: 5,
      timer: "04:12",
      period: "3rd Qtr",
    },
  ];

  it("getMatchesList formats database rows correctly", async () => {
    (matchesRepository.findAllMatchesWithClubs as jest.Mock).mockResolvedValue(
      mockRows
    );

    const matches = await getMatchesList();
    expect(matches).toHaveLength(2);
    expect(matches[0].home_club.name).toBe("Red Tigers");
    expect(matches[0].home_score).toBe(75);
    expect(matches[0].away_fouls).toBe(3);
    expect(matches[1].status).toBe("live");
  });

  it("getHomepageLiveScoreboardMatch prioritizes LIVE match first", async () => {
    (matchesRepository.findAllMatchesWithClubs as jest.Mock).mockResolvedValue(
      mockRows
    );

    const match = await getHomepageLiveScoreboardMatch();
    expect(match).not.toBeNull();
    expect(match?.id).toBe(2);
    expect(match?.status).toBe("live");
  });

  it("getHomepageLiveScoreboardMatch falls back to most recently finished match if no LIVE match", async () => {
    const finishedOnlyRows = [
      {
        ...mockRows[0],
        id: 1,
        scheduled_at: "2026-08-19T10:00:00Z",
      },
      {
        ...mockRows[0],
        id: 2,
        scheduled_at: "2026-08-20T10:00:00Z",
      },
    ];

    (matchesRepository.findAllMatchesWithClubs as jest.Mock).mockResolvedValue(
      finishedOnlyRows
    );

    const match = await getHomepageLiveScoreboardMatch();
    expect(match).not.toBeNull();
    expect(match?.id).toBe(2); // Most recent finished match
  });

  it("getHomepageLiveScoreboardMatch returns null when no matches exist", async () => {
    (matchesRepository.findAllMatchesWithClubs as jest.Mock).mockResolvedValue(
      []
    );

    const match = await getHomepageLiveScoreboardMatch();
    expect(match).toBeNull();
  });
});
