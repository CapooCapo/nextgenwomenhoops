import React from "react";
import { getTranslations } from "next-intl/server";
import { ClubRosterMember } from "../../../../types/club";
import styles from "./ClubRoster.module.scss";

interface ClubRosterProps {
  players: ClubRosterMember[];
}

export async function ClubRoster({ players }: ClubRosterProps) {
  const t = await getTranslations("clubs.profile");

  return (
    <section className={styles.section} aria-labelledby="roster-heading">
      <h2 id="roster-heading" className={styles.heading}>{t("roster.heading")}</h2>
      {players.length === 0 ? (
        <p className={styles.empty}>{t("roster.empty")}</p>
      ) : (
        <ul className={styles.grid}>
          {players.map((player) => (
            <li key={player.id} className={styles.item}>
              {player.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
