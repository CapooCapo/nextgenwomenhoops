import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { getMvpSpotlight } from "../../../../services/contentService";
import { Card } from "../../../ui/Card/Card";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { PhotoThumbnail } from "../PhotoThumbnail/PhotoThumbnail";
import styles from "./MVPSpotlightCard.module.scss";

export async function MVPSpotlightCard() {
  const locale = (await getLocale()) as "en" | "vi";
  const t = await getTranslations("gallery.mvp");
  let mvp = null;
  let error = false;

  try {
    mvp = getMvpSpotlight();
  } catch (err) {
    error = true;
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="mvp-spotlight-heading">
        <Container>
          <h2 id="mvp-spotlight-heading" className={styles.heading}>{t("heading")}</h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="mvp-spotlight-heading">
      <Container>
        <h2 id="mvp-spotlight-heading" className={styles.heading}>{t("heading")}</h2>
        
        {!mvp ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <Card className={styles.card}>
            <div className={styles.grid}>
              {mvp.photo && (
                <div className={styles.imageCol}>
                  <PhotoThumbnail photo={mvp.photo} />
                </div>
              )}
              <div className={styles.textCol}>
                <span className={styles.season}>{mvp.seasonLabel[locale]}</span>
                <h3 className={styles.playerName}>{mvp.playerName[locale]}</h3>
                <span className={styles.clubName}>{mvp.clubName[locale]}</span>
                <p className={styles.blurb}>{mvp.blurb[locale]}</p>
              </div>
            </div>
          </Card>
        )}
      </Container>
    </section>
  );
}
