import { BrandStory } from "@/components/features/about/BrandStory/BrandStory";
import { TournamentSystemSection } from "@/components/features/about/TournamentSystemSection/TournamentSystemSection";
import { PartnersSection } from "@/components/features/about/PartnersSection/PartnersSection";

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
