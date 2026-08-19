import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { BRAND } from "@/config/brand";
import "@/styles/globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Sports/display headline face — headings, section labels, and numeral
// emphasis only (see $font-family-display in _variables.scss). "vietnamese"
// subset confirmed available for this font before adopting it, so VI
// headings don't fall back to tofu/system font.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
});

// title/openGraph.title reuse BRAND.name/BRAND.tagline — already
// established as identity elements rendered identically in both locales
// (src/config/brand.ts), not new copy. `description` reuses the existing,
// already-translated home.mission.paragraph1 copy rather than inventing new
// marketing text (RULES.md R006). `metadataBase` is intentionally not
// set — the deployment domain is still OQ-001, unresolved
// (ARCHITECTURE.md §9 Environment boundaries); setting one would invent
// an unconfirmed value. `openGraph.images`/icons come from the App
// Router file-convention files (opengraph-image.jpg, icon.png,
// apple-icon.png) — not repeated here to avoid duplicate/conflicting
// <link>/<meta> tags.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("home.mission");
  const description = t("paragraph1");
  const ogLocale = locale === "vi" ? "vi_VN" : "en_US";

  return {
    title: BRAND.name,
    description,
    openGraph: {
      title: `${BRAND.name} — ${BRAND.tagline}`,
      description,
      type: "website",
      locale: ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${BRAND.name} — ${BRAND.tagline}`,
      description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("common");

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <a href="#main-content" className="skip-link">
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
