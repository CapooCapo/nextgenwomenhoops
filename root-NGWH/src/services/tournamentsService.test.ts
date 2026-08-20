import { getMatches, getSeasons } from "./tournamentsService";

describe("tournamentsService", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  describe("getMatches", () => {
    it("fetches the match list endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await getMatches();

      const requestedUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(requestedUrl.pathname).toBe("/api/matches");
      expect(mockFetch.mock.calls[0][1]).toEqual({ cache: "no-store" });
    });

    it("returns the parsed JSON body on success", async () => {
      const matches = [{ id: 1, scheduled_at: "2026-01-01T10:00:00Z" }];
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => matches });

      await expect(getMatches()).resolves.toEqual(matches);
    });

    it("throws when the response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(getMatches()).rejects.toThrow("Failed to fetch matches: 500");
    });
  });

  describe("getSeasons", () => {
    it("fetches the season list endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await getSeasons();

      const requestedUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(requestedUrl.pathname).toBe("/api/seasons");
      expect(mockFetch.mock.calls[0][1]).toEqual({ cache: "no-store" });
    });

    it("returns the parsed JSON body on success", async () => {
      const seasons = [{ id: 1, year: 2025 }];
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => seasons });

      await expect(getSeasons()).resolves.toEqual(seasons);
    });

    it("throws when the response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(getSeasons()).rejects.toThrow("Failed to fetch seasons: 500");
    });
  });
});
