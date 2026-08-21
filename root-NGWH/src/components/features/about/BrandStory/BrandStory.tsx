import React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "../../../ui/Container/Container";
import styles from "./BrandStory.module.scss";

export async function BrandStory() {
  const t = await getTranslations("about.brandStory");
  const rawPoints = typeof t.raw === "function" ? t.raw("missionPoints") : null;
  const points: string[] = Array.isArray(rawPoints)
    ? rawPoints
    : [
        "Provide structured competition for young women's basketball players",
        "Create opportunities for U20 athletes to gain competitive experience",
        "Support clubs, coaches, and athletes through a connected tournament ecosystem",
        "Promote fair and professional competition",
        "Create meaningful connections across the women's basketball community",
        "Inspire more young players to participate in the sport",
      ];

  return (
    <section className={styles.section} aria-labelledby="brand-story-heading">
      <Container>
        <div className={styles.header}>
          <span className={styles.subtitle}>ABOUT NGWH</span>
          <h1 id="brand-story-heading" className={styles.heading}>
            {t("heading")}
          </h1>
        </div>

        <div className={styles.visionGrid}>
          <div className={styles.visionCard}>
            <p className={styles.visionText}>{t("visionText")}</p>
            {t("body") && <p className={styles.body}>{t("body")}</p>}
          </div>

          <div className={styles.imageWrapper}>
            <Image
              src="/assets/about/vision.webp"
              alt={t("visionAlt")}
              width={1600}
              height={1000}
              className={styles.image}
              priority
            />
          </div>
        </div>

        <div className={styles.missionSection}>
          <h2 className={styles.missionHeading}>{t("missionHeading")}</h2>
          <ul className={styles.missionGrid}>
            {points.map((point, idx) => (
              <li key={idx} className={styles.missionCard}>
                <span className={styles.missionNumber}>0{idx + 1}</span>
                <p className={styles.missionText}>{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
