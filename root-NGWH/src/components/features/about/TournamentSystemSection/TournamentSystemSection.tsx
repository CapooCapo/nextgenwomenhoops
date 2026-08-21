import React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "../../../ui/Container/Container";
import styles from "./TournamentSystemSection.module.scss";

export async function TournamentSystemSection() {
  const t = await getTranslations("about.tournamentSystem");

  const principles = [
    {
      key: "competition",
      icon: "🏆",
      title: t("principles.competition.title"),
      desc: t("principles.competition.desc"),
    },
    {
      key: "officiating",
      icon: "⚖️",
      title: t("principles.officiating.title"),
      desc: t("principles.officiating.desc"),
    },
    {
      key: "athleteDevelopment",
      icon: "⚡",
      title: t("principles.athleteDevelopment.title"),
      desc: t("principles.athleteDevelopment.desc"),
    },
    {
      key: "matchOperations",
      icon: "📊",
      title: t("principles.matchOperations.title"),
      desc: t("principles.matchOperations.desc"),
    },
  ];

  return (
    <section className={styles.section} aria-labelledby="tournament-system-heading">
      <Container>
        <div className={styles.header}>
          <h2 id="tournament-system-heading" className={styles.heading}>
            {t("heading")}
          </h2>
          <p className={styles.intro}>{t("intro")}</p>
        </div>

        <div className={styles.visualsGrid}>
          <div className={styles.imageCard}>
            <Image
              src="/assets/about/tournament-system.webp"
              alt={t("tournamentAlt")}
              width={1600}
              height={1000}
              className={styles.image}
            />
          </div>
          <div className={styles.imageCard}>
            <Image
              src="/assets/about/athlete-development.webp"
              alt={t("developmentAlt")}
              width={1600}
              height={1000}
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.grid}>
          {principles.map((p) => (
            <div key={p.key} className={styles.card}>
              <div className={styles.iconWrapper}>{p.icon}</div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.disclaimerBox}>
          <p className={styles.disclaimerText}>{t("disclaimer")}</p>
        </div>
      </Container>
    </section>
  );
}
