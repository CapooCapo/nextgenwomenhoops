import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import en from "../../../messages/en.json";
import ClubRegistrationPage from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => {
    const value = key
      .split(".")
      .reduce<unknown>((obj, part) => (obj as Record<string, unknown>)?.[part], en);
    if (typeof value !== "string") {
      throw new Error(`Missing test translation for key: ${key}`);
    }
    return value;
  },
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/app/club-registration/actions", () => ({
  submitClubRegistrationAction: jest.fn(),
}));

const mockedCookies = jest.mocked(cookies);

describe("ClubRegistrationPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // RegistrationIntro (rendered for real here, not mocked) checks this
    // in an effect — jsdom has no built-in matchMedia implementation.
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the intro, not the form's heading, on a first visit (no intro cookie)", async () => {
    mockedCookies.mockResolvedValue({ get: () => undefined } as never);

    render(await ClubRegistrationPage());

    expect(
      screen.queryByRole("heading", { name: en.pages.clubRegistration.title }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("registration-intro")).toBeInTheDocument();
  });

  it("renders the form's heading immediately when the intro-seen cookie is set", async () => {
    mockedCookies.mockResolvedValue({
      get: (name: string) =>
        name === "club_registration_intro_seen" ? { value: "true" } : undefined,
    } as never);

    render(await ClubRegistrationPage());

    expect(
      screen.getByRole("heading", { name: en.pages.clubRegistration.title }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("registration-intro")).not.toBeInTheDocument();
  });
});
