import { HERO_VIDEO_SLIDES, HeroVideoSlide } from "@/config/heroSlides";

/**
 * Returns static Hero slides for the public website.
 * Hero section is static and governed by source assets.
 */
export async function getPublicHeroSlides(): Promise<HeroVideoSlide[]> {
  return HERO_VIDEO_SLIDES;
}
