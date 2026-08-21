import React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getPartners } from "../../../../services/contentService";
import { Partner } from "../../../../types/content";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { PartnerCard } from "../PartnerCard/PartnerCard";
import styles from "./PartnersSection.module.scss";

export async function PartnersSection() {
  const t = await getTranslations("about.partners");
  let partners: Partner[] = [];
  let error = false;

  try {
    partners = getPartners();
  } catch {
    error = true;
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="partners-heading">
        <Container>
          <h2 id="partners-heading" className={styles.heading}>{t("heading")}</h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  const roleCards = [
    {
      key: "competitionOps",
      title: t("roles.competitionOps.title"),
      desc: t("roles.competitionOps.desc"),
    },
    {
      key: "athleteDev",
      title: t("roles.athleteDev.title"),
      desc: t("roles.athleteDev.desc"),
    },
    {
      key: "eventOps",
      title: t("roles.eventOps.title"),
      desc: t("roles.eventOps.desc"),
    },
    {
      key: "mediaCommunity",
      title: t("roles.mediaCommunity.title"),
      desc: t("roles.mediaCommunity.desc"),
    },
  ];

  return (
    <section className={styles.section} aria-labelledby="partners-heading">
      <Container>
        <div className={styles.header}>
          <h2 id="partners-heading" className={styles.heading}>
            {t("heading")}
          </h2>
          <p className={styles.intro}>{t("intro")}</p>
        </div>

        <div className={styles.visualsGrid}>
          <div className={styles.imageCard}>
            <Image
              src="/assets/about/organizing-team.webp"
              alt={t("operationsAlt")}
              width={1600}
              height={1000}
              className={styles.image}
            />
          </div>
          <div className={styles.imageCard}>
            <Image
              src="/assets/about/community.webp"
              alt={t("communityAlt")}
              width={1600}
              height={1000}
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.rolesGrid}>
          {roleCards.map((role) => (
            <div key={role.key} className={styles.roleCard}>
              <h3 className={styles.roleTitle}>{role.title}</h3>
              <p className={styles.roleDesc}>{role.desc}</p>
            </div>
          ))}
        </div>

        {partners.length > 0 && (
          <div className={styles.partnersGrid}>
            {partners.map((partner, index) => (
              <PartnerCard key={index} partner={partner} />
            ))}
          </div>
        )}

        <div className={styles.noteBox}>
          <p className={styles.noteText}>{t("note")}</p>
        </div>
      </Container>
    </section>
  );
}
