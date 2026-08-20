import { cookies } from "next/headers";
import { REGISTRATION_INTRO_COOKIE_NAME } from "./introConstants";
import { markRegistrationIntroSeenAction } from "./introActions";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockedCookies = jest.mocked(cookies);

describe("markRegistrationIntroSeenAction", () => {
  it("sets the intro-seen cookie scoped to /club-registration with a ~1 year Max-Age and SameSite=Lax", async () => {
    const set = jest.fn();
    mockedCookies.mockResolvedValue({ set } as never);

    await markRegistrationIntroSeenAction();

    expect(set).toHaveBeenCalledWith(REGISTRATION_INTRO_COOKIE_NAME, "true", {
      path: "/club-registration",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  });
});
