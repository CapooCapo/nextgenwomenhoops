import { render, screen } from "@testing-library/react";
import en from "../../../messages/en.json";
import { getClubs } from "@/services/clubsService";
import ClubsPage from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace?: string) => (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const value = fullKey
      .split(".")
      .reduce<unknown>(
        (obj, part) => (obj as Record<string, unknown>)?.[part],
        en,
      );
    if (typeof value !== "string") {
      throw new Error(`Missing test translation for key: ${fullKey}`);
    }
    return value;
  },
}));

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const value = fullKey
      .split(".")
      .reduce<unknown>(
        (obj, part) => (obj as Record<string, unknown>)?.[part],
        en,
      );
    if (typeof value !== "string") {
      throw new Error(`Missing test translation for key: ${fullKey}`);
    }
    return value;
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/clubs",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/services/clubsService", () => ({
  getClubs: jest.fn(),
}));

const mockedGetClubs = jest.mocked(getClubs);

describe("ClubsPage", () => {
  beforeEach(() => {
    mockedGetClubs.mockReset();
  });

  it("fetches the list with pagination when no region is selected", async () => {
    mockedGetClubs.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "Hanoi Stars",
          logo: null,
          founding_year: null,
          achievements: null,
          province_region: "Hanoi",
        },
      ],
      pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
    });

    render(await ClubsPage({ searchParams: Promise.resolve({}) }));

    expect(mockedGetClubs).toHaveBeenCalledWith({
      provinceRegion: undefined,
      search: undefined,
      page: 1,
      limit: 9,
    });
    expect(screen.getByText("Hanoi Stars")).toBeInTheDocument();
  });

  it("passes region parameter to getClubs when a region is selected", async () => {
    mockedGetClubs.mockResolvedValue({
      data: [
        {
          id: 1,
          name: "Hanoi Stars",
          logo: null,
          founding_year: null,
          achievements: null,
          province_region: "Hanoi",
        },
      ],
      pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
    });

    render(
      await ClubsPage({ searchParams: Promise.resolve({ region: "Hanoi" }) }),
    );

    expect(mockedGetClubs).toHaveBeenCalledWith({
      provinceRegion: "Hanoi",
      search: undefined,
      page: 1,
      limit: 9,
    });
    expect(screen.getByText("Hanoi Stars")).toBeInTheDocument();
  });

  it("renders the shared ErrorMessage instead of the list when the fetch fails", async () => {
    mockedGetClubs.mockRejectedValue(new Error("network error"));

    render(await ClubsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      en.clubs.directory.error,
    );
  });
});
