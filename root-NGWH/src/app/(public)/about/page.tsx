import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BrandStory } from "@/components/features/about/BrandStory/BrandStory";
import { TournamentSystemSection } from "@/components/features/about/TournamentSystemSection/TournamentSystemSection";
import { PartnersSection } from "@/components/features/about/PartnersSection/PartnersSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("pages.about.title");
  const description = t("about.brandStory.visionText");

  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: { title, description, url: "/about", type: "website" },
  };
}

// Sprint 1 — REQ-ABOUT-001/002/003. See .ai/lld/about.md. Sections are
// invoked and awaited directly (Promise.all), not nested as <Foo /> JSX —
// same corrected composition pattern as Home/News.
export default async function AboutPage() {
  const [brandStory, tournamentSystem, partners] = await Promise.all([
    BrandStory(),
    TournamentSystemSection(),
    PartnersSection(),
  ]);

  return (
    <>
      {brandStory}
      {tournamentSystem}
      {partners}
    </>
  );
}
