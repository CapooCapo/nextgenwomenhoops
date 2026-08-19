"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAppLocale } from "./routing";
import { LOCALE_COOKIE_NAME } from "./request";

export async function setLocaleAction(locale: string) {
  if (!isAppLocale(locale)) {
    return;
  }
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  // Revalidate the whole tree rooted at the shared layout that reads the
  // locale cookie, not just "/", so every route reflects the new locale.
  revalidatePath("/", "layout");
}
