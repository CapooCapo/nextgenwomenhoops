import React from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "../../../ui/Container/Container";
import styles from "./MissionOverview.module.scss";

export async function MissionOverview() {
  const t = await getTranslations("home.mission");

  return (
    <section className={styles.section} aria-labelledby="mission-heading">
      <Container>
        <div className={styles.content}>
          <h2 id="mission-heading" className={styles.heading}>
            {t("heading")}
          </h2>
          <div className={styles.body}>
            <p>{t("paragraph1")}</p>
            <p>{t("paragraph2")}</p>
            <p>{t("paragraph3")}</p>
          </div>
          <p className={styles.tagline}>{t("tagline")}</p>
        </div>
      </Container>
    </section>
  );
}
