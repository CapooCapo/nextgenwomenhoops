import { render, screen } from "@testing-library/react";
import en from "../../messages/en.json";
import { BRAND } from "@/config/brand";
import HomePage from "./(public)/page";
import AboutPage from "./(public)/about/page";
import TournamentsPage from "./(public)/tournaments/page";
import GalleryPage from "./(public)/gallery/page";
import ClubsPage from "./(public)/clubs/page";
import ClubRegistrationPage from "./(public)/club-registration/page";
import NewsPage from "./(public)/news/page";
import ContactPage from "./(public)/contact/page";

// Page components are async Server Components that call next-intl's
// getTranslations(); outside a real Next.js request there is no request
// context for it to read from, so it's mocked here to look up keys
// directly against the real en.json fixture (no duplicated strings).
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
  getLocale: async () => "en",
  getFormatter: async () => ({
    dateTime: (date: Date) => date.toISOString().slice(0, 10),
  }),
}));

// ClubDirectoryFilter/RegistrationForm (rendered by ClubsPage/
// ClubRegistrationPage) are Client Components using next-intl's
// useTranslations and next/navigation — neither has a real
// request/router context in this smoke test. Respects the namespace
// argument so it resolves correctly for every Client Component's own
// namespace, not just one hardcoded prefix.
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
  useLocale: () => "en",
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString().slice(0, 10),
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/clubs",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
}));

jest.mock("@/server/auth/userAuth", () => ({
  getUserSession: jest.fn().mockResolvedValue({
    authenticated: true,
    user: { id: 1, email: "test@example.com", role: "club_user" },
  }),
}));

// ClubRegistrationPage reads the intro-seen cookie server-side; mocked
// here as already-seen so this routing-shell smoke test (which asserts
// the page's real <h1> renders) isn't gated behind the first-visit intro
// — the intro itself has its own dedicated test coverage.
jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "club_registration_intro_seen" ? { value: "true" } : undefined,
  }),
}));

// ClubsPage fetches from the API service; mocked here since this is a
// routing-shell smoke test, not a network integration test.
jest.mock("@/services/clubsService", () => ({
  getClubs: jest.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 9, total: 0, totalPages: 1 },
  }),
}));

jest.mock("@/services/contentService", () => ({
  getHotNews: jest.fn().mockResolvedValue([]),
  getDefendingChampion: jest.fn().mockReturnValue(null),
}));

jest.mock("@/server/services/matchesServerService", () => ({
  getHomepageLiveScoreboardMatch: jest.fn().mockResolvedValue(null),
}));

// RegistrationForm submits via this Server Action; mocked here for the
// same reason — a routing-shell smoke test, not a network integration
// test.
jest.mock("@/app/(public)/club-registration/actions", () => ({
  submitClubRegistrationAction: jest.fn(),
}));

/**
 * Sprint 0 routing-shell smoke tests: every sitemap page renders without
 * crashing and shows its expected (English) title. No business content
 * is asserted here since none is implemented yet.
 */
describe("Sprint 0 routing shell", () => {
  beforeEach(() => {
    // HomePage renders HeroCarousel (Client Component), which checks
    // matchMedia and plays its active slide's video on mount.
    HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = jest.fn();
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  const routes: Array<[string, () => Promise<React.JSX.Element>, string]> = [
    ["/", HomePage, BRAND.tagline],
    ["/about", AboutPage, en.about.brandStory.heading],
    ["/tournaments", TournamentsPage, en.pages.tournaments.title],
    ["/gallery", GalleryPage, en.pages.gallery.title],
    [
      "/clubs",
      () => ClubsPage({ searchParams: Promise.resolve({}) }),
      en.pages.clubs.title,
    ],
    [
      "/club-registration",
      ClubRegistrationPage,
      en.pages.clubRegistration.title,
    ],
    ["/news", NewsPage, en.pages.news.title],
    ["/contact", ContactPage, en.pages.contact.title],
  ];

  it.each(routes)(
    "%s renders its expected title",
    async (_path, Page, title) => {
      const ui = await Page();
      render(ui);
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    },
  );
});
