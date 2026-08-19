import React from "react";
import { getTranslations } from "next-intl/server";
import { getBehindScenesStories } from "../../../../services/contentService";
import { BehindScenesStory } from "../../../../types/content";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { BehindScenesEssay } from "../BehindScenesEssay/BehindScenesEssay";
import styles from "./BehindScenesSection.module.scss";

export async function BehindScenesSection() {
  const t = await getTranslations("gallery.behindScenes");
  let stories: BehindScenesStory[] = [];
  let error = false;

  try {
    stories = getBehindScenesStories();
  } catch {
    error = true;
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="behind-scenes-heading">
        <Container>
          <h2 id="behind-scenes-heading" className={styles.heading}>{t("heading")}</h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="behind-scenes-heading">
      <Container>
        <h2 id="behind-scenes-heading" className={styles.heading}>{t("heading")}</h2>
        
        {stories.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <div className={styles.grid}>
            {stories.map((story, index) => (
              <BehindScenesEssay key={index} story={story} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
