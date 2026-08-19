import { HeroSection } from "@/components/features/home/HeroSection/HeroSection";
import { MissionOverview } from "@/components/features/home/MissionOverview/MissionOverview";
import { HotNewsList } from "@/components/features/home/HotNewsList/HotNewsList";
import { ChampionsCorner } from "@/components/features/home/ChampionsCorner/ChampionsCorner";

// Sprint 1 — REQ-BRAND-001/003, REQ-HOME-001/002/003/004/006. See
// .ai/lld/home.md. REQ-HOME-005 ("Live & Results") is BLOCKED on
// OQ-004/OQ-005 and intentionally has no section here.
//
// Sections are invoked and awaited directly (not used as `<Foo />` JSX)
// because each is itself an async Server Component — nesting async
// components as JSX children of another async component isn't resolvable
// outside Next's own RSC renderer (breaks under plain react-dom, including
// tests).
export default async function HomePage() {
  const [hero, mission, hotNews, championsCorner] = await Promise.all([
    HeroSection(),
    MissionOverview(),
    HotNewsList(),
    ChampionsCorner(),
  ]);

  return (
    <>
      {hero}
      {mission}
      {hotNews}
      {championsCorner}
    </>
  );
}
