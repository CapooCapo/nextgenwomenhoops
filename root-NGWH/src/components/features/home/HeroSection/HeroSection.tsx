import React from "react";
import { getTranslations } from "next-intl/server";
import { BRAND } from "../../../../config/brand";
import { BRAND_ASSETS } from "../../../../config/brandAssets";
import { HERO_VIDEO_SLIDES } from "../../../../config/heroSlides";
import { HeroCarousel } from "../HeroCarousel/HeroCarousel";
import styles from "./HeroSection.module.scss";

export async function HeroSection() {
  const t = await getTranslations("home.hero");

  return (
    <div className={styles.wrapper}>
      <HeroCarousel
        slides={HERO_VIDEO_SLIDES}
        posterSrc={BRAND_ASSETS.hero}
        posterAlt={t("imageAlt")}
        eyebrow={BRAND.name}
        tagline={BRAND.tagline}
        description=""
        ctaLabel={t("cta")}
        previousLabel={t("previousSlide")}
        nextLabel={t("nextSlide")}
        goToSlideLabels={HERO_VIDEO_SLIDES.map((_, i) => t("goToSlide", { number: i + 1 }))}
      />
    </div>
  );
}
