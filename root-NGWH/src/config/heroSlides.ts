export interface HeroVideoSlide {
  id: string;
  videoSrc: string;
  posterSrc?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

/**
 * Static Hero Section Slide Configuration.
 * Hero assets are source-controlled static assets living exclusively under public/assets/hero/.
 * External URLs, YouTube embeds, and database-driven media are strictly prohibited.
 */
export const HERO_VIDEO_SLIDES: HeroVideoSlide[] = [
  {
    id: "hero-featured-video-1",
    videoSrc: "/assets/hero/hero-video.mp4",
    posterSrc: "/assets/hero/hero-poster.png",
    title: "Where Tomorrow's Legends Rise",
    description: "NextGen Women Hoops is a U20 female basketball platform dedicated to discovering, developing, and elevating young talents.",
    ctaLabel: "Explore Tournaments",
    ctaLink: "/tournaments",
  },
  {
    id: "hero-featured-video-2",
    videoSrc: "/assets/hero/hero-video-2.mp4",
    posterSrc: "/assets/hero/hero-poster.png",
    title: "Precision & Speed",
    description: "Showcasing world-class skills, execution, and determination on the court.",
    ctaLabel: "View Roster",
    ctaLink: "/clubs",
  },
  {
    id: "hero-featured-video-3",
    videoSrc: "/assets/hero/hero-video-3.mp4",
    posterSrc: "/assets/hero/hero-poster.png",
    title: "Passion & Intensity",
    description: "Uniting top U20 athletes across regional and national stages.",
    ctaLabel: "Check Schedule",
    ctaLink: "/tournaments",
  },
];
