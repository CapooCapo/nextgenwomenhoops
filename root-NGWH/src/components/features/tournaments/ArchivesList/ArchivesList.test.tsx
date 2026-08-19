import { render, screen } from "@testing-library/react";
import en from "../../../../../messages/en.json";
import { getSeasons } from "@/services/tournamentsService";
import { ArchivesList } from "./ArchivesList";

jest.mock("@/services/tournamentsService", () => ({
  getSeasons: jest.fn(),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string, params?: Record<string, unknown>) => {
    const value = key
      .split(".")
      .reduce<unknown>((obj, part) => (obj as Record<string, unknown>)?.[part], en);
    if (typeof value !== "string") {
      throw new Error(`Missing test translation for key: ${key}`);
    }
    return params?.year !== undefined ? value.replace("{year}", String(params.year)) : value;
  },
}));

const mockedGetSeasons = jest.mocked(getSeasons);

describe("ArchivesList", () => {
  beforeEach(() => {
    mockedGetSeasons.mockReset();
  });

  it("renders the section heading", async () => {
    mockedGetSeasons.mockResolvedValueOnce([]);
    render(await ArchivesList());
    expect(
      screen.getByRole("heading", { name: en.tournaments.archives.heading }),
    ).toBeInTheDocument();
  });

  it("renders the empty state when there are no seasons", async () => {
    mockedGetSeasons.mockResolvedValueOnce([]);
    render(await ArchivesList());
    expect(screen.getByText(en.tournaments.archives.empty)).toBeInTheDocument();
  });

  it("renders one labeled list item per season, most recent first as returned by the API", async () => {
    mockedGetSeasons.mockResolvedValueOnce([
      { id: 2, year: 2025 },
      { id: 1, year: 2024 },
    ]);
    render(await ArchivesList());

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("2025");
    expect(items[1]).toHaveTextContent("2024");
  });

  it("renders ErrorMessage when the fetch fails", async () => {
    mockedGetSeasons.mockRejectedValueOnce(new Error("network error"));
    render(await ArchivesList());
    expect(screen.getByRole("alert")).toHaveTextContent(en.tournaments.archives.error);
    expect(screen.queryByText(en.tournaments.archives.empty)).not.toBeInTheDocument();
  });
});
