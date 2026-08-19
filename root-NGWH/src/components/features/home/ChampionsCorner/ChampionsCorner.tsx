import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { getDefendingChampion } from "../../../../services/contentService";
import { Card } from "../../../ui/Card/Card";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { MediaSlot } from "../../../ui/MediaSlot/MediaSlot";
import styles from "./ChampionsCorner.module.scss";

export async function ChampionsCorner() {
  const locale = (await getLocale()) as "en" | "vi";
  const t = await getTranslations("home.championsCorner");
  let champion = null;
  let error = false;

  try {
    champion = getDefendingChampion();
  } catch (err) {
    error = true;
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="champions-heading">
        <Container>
          <h2 id="champions-heading" className={styles.heading}>{t("heading")}</h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="champions-heading">
      <Container>
        <h2 id="champions-heading" className={styles.heading}>{t("heading")}</h2>
        
        {!champion ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <Card className={styles.card}>
            <div className={styles.grid}>
              <div className={styles.imageCol}>
                {champion.photo ? (
                  <MediaSlot
                    src={champion.photo.src}
                    alt={champion.photo.alt[locale]}
                    className={styles.media}
                  />
                ) : (
                  <div className={styles.placeholderImage} />
                )}
              </div>
              <div className={styles.textCol}>
                <span className={styles.season}>{champion.seasonLabel[locale]}</span>
                <h3 className={styles.clubName}>{champion.clubName[locale]}</h3>
                <p className={styles.blurb}>{champion.blurb[locale]}</p>
              </div>
            </div>
          </Card>
        )}
      </Container>
    </section>
  );
}
