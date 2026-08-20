import { HeroSection } from "@/components/features/home/HeroSection/HeroSection";
import { MissionOverview } from "@/components/features/home/MissionOverview/MissionOverview";
import { HotNewsList } from "@/components/features/home/HotNewsList/HotNewsList";
import { LiveScoreboard } from "@/components/features/home/LiveScoreboard/LiveScoreboard";
import { ChampionsCorner } from "@/components/features/home/ChampionsCorner/ChampionsCorner";

// REQ-HOME-005 ("Live & Results") unblocked and added immediately before Champions Corner.
export default async function HomePage() {
  const [hero, mission, hotNews, liveScoreboard, championsCorner] = await Promise.all([
    HeroSection(),
    MissionOverview(),
    HotNewsList(),
    LiveScoreboard(),
    ChampionsCorner(),
  ]);

  return (
    <>
      {hero}
      {mission}
      {hotNews}
      {liveScoreboard}
      {championsCorner}
    </>
  );
}
