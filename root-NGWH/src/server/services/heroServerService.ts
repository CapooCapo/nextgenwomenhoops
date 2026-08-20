import { HERO_VIDEO_SLIDES, HeroVideoSlide } from "@/config/heroSlides";
import { findEnabledHeroSlides } from "@/server/repositories/heroRepository";

export async function getPublicHeroSlides(): Promise<HeroVideoSlide[]> {
  try {
    const slides = await findEnabledHeroSlides();
    if (slides && slides.length > 0) {
      return slides.map((s) => ({
        id: s.slide_id,
        videoSrc: s.video_src,
      }));
    }
  } catch {
    // DB query failed or table uninitialized, fallback to static config
  }
  return HERO_VIDEO_SLIDES;
}
