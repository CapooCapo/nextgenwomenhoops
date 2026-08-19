import React from "react";
import { getTranslations } from "next-intl/server";
import { formatTextListField } from "../../../../utils/clubFields";
import styles from "./ClubAchievements.module.scss";

interface ClubAchievementsProps {
  achievements: unknown;
}

export async function ClubAchievements({ achievements }: ClubAchievementsProps) {
  const t = await getTranslations("clubs.profile");
  const items = formatTextListField(achievements);

  return (
    <section className={styles.section} aria-labelledby="achievements-heading">
      <h2 id="achievements-heading" className={styles.heading}>{t("achievements.heading")}</h2>
      {items.length === 0 ? (
        <p className={styles.empty}>{t("achievements.empty")}</p>
      ) : (
        <div className={styles.content}>
          {items.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      )}
    </section>
  );
}
