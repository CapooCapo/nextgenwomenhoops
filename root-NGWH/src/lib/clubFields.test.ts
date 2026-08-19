import { formatTextListField, isUrlLike } from "./clubFields";

describe("formatTextListField", () => {
  it("returns a text field for a non-empty string", () => {
    expect(formatTextListField("National champion 2020")).toEqual({
      kind: "text",
      value: "National champion 2020",
    });
  });

  it("returns null for an empty or whitespace-only string", () => {
    expect(formatTextListField("")).toBeNull();
    expect(formatTextListField("   ")).toBeNull();
  });

  it("returns a list field for an array of strings", () => {
    expect(formatTextListField(["Regional cup 2019", "Fair play award"])).toEqual({
      kind: "list",
      values: ["Regional cup 2019", "Fair play award"],
    });
  });

  it("filters out empty/whitespace-only strings from an array", () => {
    expect(formatTextListField(["Valid", "", "  "])).toEqual({
      kind: "list",
      values: ["Valid"],
    });
  });

  it("filters out non-string items from an array", () => {
    expect(formatTextListField(["Valid", 42, { a: 1 }, null])).toEqual({
      kind: "list",
      values: ["Valid"],
    });
  });

  it("returns null for an array with no usable string items", () => {
    expect(formatTextListField([42, { a: 1 }, null])).toBeNull();
  });

  it("returns null for an empty array", () => {
    expect(formatTextListField([])).toBeNull();
  });

  it("returns null for null, undefined, numbers, and plain objects", () => {
    expect(formatTextListField(null)).toBeNull();
    expect(formatTextListField(undefined)).toBeNull();
    expect(formatTextListField(42)).toBeNull();
    expect(formatTextListField({ platform: "facebook", url: "https://facebook.com/x" })).toBeNull();
  });
});

describe("isUrlLike", () => {
  it("returns true for http/https URLs", () => {
    expect(isUrlLike("https://example.com")).toBe(true);
    expect(isUrlLike("http://example.com")).toBe(true);
  });

  it("trims surrounding whitespace before checking", () => {
    expect(isUrlLike("  https://example.com  ")).toBe(true);
  });

  it("returns false for a bare domain or non-http scheme", () => {
    expect(isUrlLike("example.com")).toBe(false);
    expect(isUrlLike("ftp://example.com")).toBe(false);
    expect(isUrlLike("facebook.com/example")).toBe(false);
  });
});
