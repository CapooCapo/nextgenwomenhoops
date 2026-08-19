// REQ-GLOBAL-001: minimum 2 languages (Vietnamese & English). No URL-based
// locale routing is used — ARCHITECTURE.md does not require it, and the
// existing flat routing shell (src/app/*) is preserved unchanged. Locale
// is tracked via a cookie instead (see request.ts / LanguageSwitcher).
export const locales = ["en", "vi"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
