import {
  findAllClubsAdmin,
  updateClubApprovalStatus,
  deleteClubById,
} from "./adminClubsRepository";
import { query } from "../db/client";
import { ClubRow } from "../db/types";

jest.mock("../db/client", () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));

describe("adminClubsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("findAllClubsAdmin queries database correctly without parameters", async () => {
    const mockClubs: Partial<ClubRow>[] = [
      { id: 1, name: "Club A", is_approved: true },
      { id: 2, name: "Club B", is_approved: false },
    ];
    (query as jest.MockedFunction<typeof query>)
      .mockResolvedValueOnce([{ count: 2 }] as unknown as Record<string, unknown>[])
      .mockResolvedValueOnce(mockClubs as unknown as ClubRow[]);

    const result = await findAllClubsAdmin();
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("SELECT COUNT(*)::int AS count"),
      []
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("SELECT id, name"),
      [20, 0]
    );
    expect(result).toEqual({
      clubs: mockClubs,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });

  it("findAllClubsAdmin applies filter and pagination parameters correctly", async () => {
    (query as jest.MockedFunction<typeof query>)
      .mockResolvedValueOnce([{ count: 25 }] as unknown as Record<string, unknown>[])
      .mockResolvedValueOnce([]);

    await findAllClubsAdmin({ isApproved: false, search: "Hanoi", page: 2, pageSize: 20 });
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("WHERE is_approved = $1 AND (name ILIKE $2 OR province_region ILIKE $2 OR representative_name ILIKE $2)"),
      [false, "%Hanoi%"]
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("LIMIT $3 OFFSET $4"),
      [false, "%Hanoi%", 20, 20]
    );
  });

  it("updateClubApprovalStatus updates approval status", async () => {
    const mockUpdated: Partial<ClubRow> = { id: 1, name: "Club A", is_approved: true };
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([mockUpdated] as unknown as ClubRow[]);

    const result = await updateClubApprovalStatus(1, true);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE clubs_club"),
      [true, 1]
    );
    expect(result).toEqual(mockUpdated);
  });

  it("deleteClubById executes deletion query", async () => {
    (query as jest.MockedFunction<typeof query>).mockResolvedValueOnce([{ id: 1 }] as unknown as Record<string, unknown>[]);

    const result = await deleteClubById(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM clubs_club"),
      [1]
    );
    expect(result).toBe(true);
  });
});
