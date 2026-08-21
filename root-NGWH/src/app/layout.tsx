import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { BRAND } from "@/config/brand";
import { SITE_URL } from "@/config/seo";
import "@/styles/globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("home.mission");
  const description = t("paragraph1");
  const ogLocale = locale === "vi" ? "vi_VN" : "en_US";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${BRAND.name} — ${BRAND.tagline}`,
      template: `%s | ${BRAND.name}`,
    },
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      siteName: BRAND.name,
      title: `${BRAND.name} — ${BRAND.tagline}`,
      description,
      url: "/",
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

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: BRAND.name,
  alternateName: BRAND.abbreviation,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  sport: "Basketball",
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND.name,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/clubs?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
