import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isAppLocale, type AppLocale } from "./routing";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export async function getCurrentLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return cookieValue && isAppLocale(cookieValue) ? cookieValue : defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getCurrentLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
