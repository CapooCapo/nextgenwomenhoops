"use server";

import { cookies } from "next/headers";
import { REGISTRATION_INTRO_COOKIE_NAME } from "./introConstants";

// UX enhancement (not requirement-workbook-sourced — see
// .ai/lld/club-registration.md §21): first-visit animated intro on the
// registration page. Cookie name/attributes are exactly as specified by
// the request that authorized this addition. Follows the same
// `"use server"` cookie-setting precedent already established by
// `setLocaleAction` (src/i18n/actions.ts).
const REGISTRATION_INTRO_COOKIE_PATH = "/club-registration";
const REGISTRATION_INTRO_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // ~1 year

export async function markRegistrationIntroSeenAction() {
  const cookieStore = await cookies();
  cookieStore.set(REGISTRATION_INTRO_COOKIE_NAME, "true", {
    path: REGISTRATION_INTRO_COOKIE_PATH,
    sameSite: "lax",
    maxAge: REGISTRATION_INTRO_COOKIE_MAX_AGE,
  });
}
