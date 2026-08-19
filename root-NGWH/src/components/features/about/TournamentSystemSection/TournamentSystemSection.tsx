import React from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "../../../ui/Container/Container";
import styles from "./TournamentSystemSection.module.scss";

export async function TournamentSystemSection() {
  const t = await getTranslations("about.tournamentSystem");

  return (
    <section className={styles.section} aria-labelledby="tournament-system-heading">
      <Container>
        <div className={styles.content}>
          <h2 id="tournament-system-heading" className={styles.heading}>{t("heading")}</h2>
          <p className={styles.body}>{t("body")}</p>
        </div>
      </Container>
    </section>
  );
}
