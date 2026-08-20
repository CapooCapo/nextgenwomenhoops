export interface HeroVideoSlide {
  id: string;
  videoSrc: string;
  posterSrc?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export const HERO_VIDEO_SLIDES: HeroVideoSlide[] = [
  {
    id: "nba-lakers-girls",
    videoSrc:
      "https://www.nba.com/lakers/videos/can-a-world-champion-gymnast-learn-a-lakers-girls-routine?playlistId=1091479",
    title: "Can a World Champion Gymnast Learn a Lakers Girls Routine?",
  },
  // Female basketball team + coach on an indoor court
  { id: "team-huddle", videoSrc: "/videos/hero/team-huddle.mp4" },
  // Female basketball players training / running a drill
  { id: "training-drill", videoSrc: "/videos/hero/training-drill.mp4" },
  // Female player dribbling the ball
  { id: "dribbling", videoSrc: "/videos/hero/dribbling.mp4" },
  // Female athletes celebrating on court
  { id: "celebration", videoSrc: "/videos/hero/celebration.mp4" },
];
