import {
  buildMediaUrl,
  normalizeMediaField,
  normalizeMediaList,
} from "./clubMediaService";

describe("clubMediaService", () => {
  describe("buildMediaUrl", () => {
    it("builds the single current media URL shape", () => {
      expect(buildMediaUrl(56, "logo", 16)).toBe("/media/clubs/56/logo/16");
      expect(buildMediaUrl(56, "u20_athlete", 3)).toBe(
        "/media/clubs/56/u20_athlete/3"
      );
    });
  });

  describe("normalizeMediaField", () => {
    it("returns null for null/empty input", () => {
      expect(normalizeMediaField(null)).toBeNull();
      expect(normalizeMediaField(undefined)).toBeNull();
      expect(normalizeMediaField("")).toBeNull();
    });

    it("passes through already-current /media/ URLs unchanged", () => {
      expect(normalizeMediaField("/media/clubs/56/logo/16")).toBe(
        "/media/clubs/56/logo/16"
      );
    });

    it("passes through absolute http(s) URLs unchanged", () => {
      expect(normalizeMediaField("http://example.com/x.png")).toBe(
        "http://example.com/x.png"
      );
      expect(normalizeMediaField("https://example.com/x.png")).toBe(
        "https://example.com/x.png"
      );
    });

    it("passes through a JSON-array-shaped string unchanged", () => {
      const raw = '["/media/clubs/56/u20_athlete/3"]';
      expect(normalizeMediaField(raw)).toBe(raw);
    });

    it("prefixes a bare legacy filesystem path with /media/", () => {
      expect(
        normalizeMediaField("clubs/registrations/uuid-1/logo.png")
      ).toBe("/media/clubs/registrations/uuid-1/logo.png");
    });
  });

  describe("normalizeMediaList", () => {
    it("returns an empty array for null/empty input", () => {
      expect(normalizeMediaList(null)).toEqual([]);
      expect(normalizeMediaList(undefined)).toEqual([]);
      expect(normalizeMediaList("")).toEqual([]);
    });

    it("parses a current-format JSON array and preserves order", () => {
      const raw = JSON.stringify([
        "/media/clubs/56/u20_athlete/3",
        "/media/clubs/56/u20_athlete/4",
        "/media/clubs/56/u20_athlete/5",
      ]);
      expect(normalizeMediaList(raw)).toEqual([
        "/media/clubs/56/u20_athlete/3",
        "/media/clubs/56/u20_athlete/4",
        "/media/clubs/56/u20_athlete/5",
      ]);
    });

    it("normalizes each entry of a legacy-path JSON array", () => {
      const raw = JSON.stringify(["clubs/registrations/uuid-1/a.png"]);
      expect(normalizeMediaList(raw)).toEqual([
        "/media/clubs/registrations/uuid-1/a.png",
      ]);
    });

    it("falls back to treating a non-array raw value as a single legacy path", () => {
      expect(
        normalizeMediaList("clubs/registrations/uuid-1/single.png")
      ).toEqual(["/media/clubs/registrations/uuid-1/single.png"]);
    });

    it("falls back to the raw string when it looks like an array but fails to parse", () => {
      // Starts with "[" so normalizeMediaField's passthrough rule applies
      // unchanged, exactly as it did before this refactor.
      expect(normalizeMediaList("[not valid json]")).toEqual([
        "[not valid json]",
      ]);
    });
  });
});
