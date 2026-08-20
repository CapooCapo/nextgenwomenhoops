import React from "react";
import { getTranslations } from "next-intl/server";
import { formatAchievements } from "../../../../utils/clubFields";
import styles from "./ClubAchievements.module.scss";

interface ClubAchievementsProps {
  achievements: unknown;
}

export async function ClubAchievements({ achievements }: ClubAchievementsProps) {
  const t = await getTranslations("clubs.profile");
  const items = formatAchievements(achievements);

  return (
    <section className={styles.section} aria-labelledby="achievements-heading">
      <h2 id="achievements-heading" className={styles.heading}>
        {t("achievements.heading")}
      </h2>
      {items.length === 0 ? (
        <p className={styles.empty}>{t("achievements.empty")}</p>
      ) : (
        <ul className={styles.content}>
          {items.map((item, index) => (
            <li key={index} className={styles.item}>
              <div className={styles.itemTitleRow}>
                <span className={styles.itemTitle}>{item.title}</span>
                {item.year && <span className={styles.itemYear}>({item.year})</span>}
              </div>
              {item.description && (
                <p className={styles.itemDescription}>{item.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
