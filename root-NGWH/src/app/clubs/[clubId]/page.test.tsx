import { render, screen } from "@testing-library/react";
import en from "../../../../messages/en.json";
import { getClubById } from "@/services/clubsService";
import type { ClubDetail } from "@/types/club";
import ClubProfilePage from "./page";

jest.mock("@/services/clubsService", () => ({
  getClubById: jest.fn(),
}));

const notFound = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
jest.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace?: string) => (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const value = fullKey
      .split(".")
      .reduce<unknown>((obj, part) => (obj as Record<string, unknown>)?.[part], en);
    if (typeof value !== "string") {
      throw new Error(`Missing test translation for key: ${fullKey}`);
    }
    return value;
  },
}));

const mockedGetClubById = jest.mocked(getClubById);

const fullClub: ClubDetail = {
  id: 1,
  name: "Hanoi Stars",
  logo: null,
  founding_year: 2010,
  achievements: "National champion 2020",
  province_region: "Hanoi",
  contact_info: "club@example.com",
  social_links: "https://facebook.com/example",
  players: [{ id: 1, name: "Player One" }],
  coach_staff: [{ id: 1, name: "Coach One" }],
};

describe("ClubProfilePage", () => {
  beforeEach(() => {
    mockedGetClubById.mockReset();
    notFound.mockClear();
  });

  it("renders the club header and all confirmed sections for an approved club", async () => {
    mockedGetClubById.mockResolvedValueOnce(fullClub);

    render(await ClubProfilePage({ params: Promise.resolve({ clubId: "1" }) }));

    expect(mockedGetClubById).toHaveBeenCalledWith("1");
    expect(screen.getByRole("heading", { level: 1, name: "Hanoi Stars" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: en.clubs.profile.achievements.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: en.clubs.profile.roster.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: en.clubs.profile.coachingStaff.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: en.clubs.profile.contact.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText("Player One")).toBeInTheDocument();
    expect(screen.getByText("Coach One")).toBeInTheDocument();
  });

  it("calls notFound() when the club is missing or unapproved (both resolve to null)", async () => {
    mockedGetClubById.mockResolvedValueOnce(null);

    await expect(
      ClubProfilePage({ params: Promise.resolve({ clubId: "999" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("renders the shared ErrorMessage, not notFound(), on a genuine fetch failure", async () => {
    mockedGetClubById.mockRejectedValueOnce(new Error("network error"));

    render(await ClubProfilePage({ params: Promise.resolve({ clubId: "1" }) }));

    expect(screen.getByRole("alert")).toHaveTextContent(en.clubs.profile.error);
    expect(notFound).not.toHaveBeenCalled();
  });
});
