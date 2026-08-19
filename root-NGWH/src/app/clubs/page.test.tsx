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

  it("fetches the unfiltered list once when no region is selected", async () => {
    mockedGetClubs.mockResolvedValueOnce([
      {
        id: 1,
        name: "Hanoi Stars",
        logo: null,
        founding_year: null,
        achievements: null,
        province_region: "Hanoi",
      },
    ]);

    render(await ClubsPage({ searchParams: Promise.resolve({}) }));

    expect(mockedGetClubs).toHaveBeenCalledTimes(1);
    expect(mockedGetClubs).toHaveBeenCalledWith();
    expect(screen.getByText("Hanoi Stars")).toBeInTheDocument();
  });

  it("fetches the collection once and filters in memory when a region is selected", async () => {
    mockedGetClubs.mockResolvedValueOnce([
      {
        id: 1,
        name: "Hanoi Stars",
        logo: null,
        founding_year: null,
        achievements: null,
        province_region: "Hanoi",
      },
      {
        id: 2,
        name: "HCMC Aces",
        logo: null,
        founding_year: null,
        achievements: null,
        province_region: "Ho Chi Minh City",
      },
    ]);

    render(
      await ClubsPage({ searchParams: Promise.resolve({ region: "Hanoi" }) }),
    );

    expect(mockedGetClubs).toHaveBeenCalledTimes(1);
    expect(mockedGetClubs).toHaveBeenCalledWith();
    expect(screen.getByText("Hanoi Stars")).toBeInTheDocument();
    expect(screen.queryByText("HCMC Aces")).not.toBeInTheDocument();
  });

  it("renders the shared ErrorMessage instead of the list when the fetch fails", async () => {
    mockedGetClubs.mockRejectedValueOnce(new Error("network error"));

    render(await ClubsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      en.clubs.directory.error,
    );
  });
});
