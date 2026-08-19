import { getSeasonsList } from "./seasonsServerService";
import * as seasonsRepository from "../repositories/seasonsRepository";

jest.mock("../repositories/seasonsRepository");

describe("seasonsServerService", () => {
  it("returns formatted list of seasons ordered by year DESC", async () => {
    (seasonsRepository.findAllSeasons as jest.Mock).mockResolvedValue([
      { id: 2, tournament_id: 1, year: 2025 },
      { id: 1, tournament_id: 1, year: 2024 },
    ]);

    const result = await getSeasonsList();
    expect(result).toEqual([
      { id: 2, year: 2025 },
      { id: 1, year: 2024 },
    ]);
  });
});
