import React from "react";
import { getTranslations } from "next-intl/server";
import { BRAND } from "../../../../config/brand";
import { BRAND_ASSETS } from "../../../../config/brandAssets";
import { getPublicHeroSlides } from "@/server/services/heroServerService";
import { HeroCarousel } from "../HeroCarousel/HeroCarousel";
import styles from "./HeroSection.module.scss";

export async function HeroSection() {
  const t = await getTranslations("home.hero");
  const slides = await getPublicHeroSlides();

  return (
    <div className={styles.wrapper}>
      <HeroCarousel
        slides={slides}
        posterSrc={BRAND_ASSETS.hero}
        posterAlt={t("imageAlt")}
        eyebrow={BRAND.name}
        tagline={BRAND.tagline}
        description=""
        ctaLabel={t("cta")}
        previousLabel={t("previousSlide")}
        nextLabel={t("nextSlide")}
        goToSlideLabels={slides.map((_, i) => t("goToSlide", { number: i + 1 }))}
      />
    </div>
  );
}
