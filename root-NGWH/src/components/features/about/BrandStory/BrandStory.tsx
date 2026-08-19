import React from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "../../../ui/Container/Container";
import styles from "./BrandStory.module.scss";

export async function BrandStory() {
  const t = await getTranslations("about.brandStory");

  return (
    <section className={styles.section} aria-labelledby="brand-story-heading">
      <Container>
        <div className={styles.content}>
          <h1 id="brand-story-heading" className={styles.heading}>{t("heading")}</h1>
          <p className={styles.body}>{t("body")}</p>
        </div>
      </Container>
    </section>
  );
}
