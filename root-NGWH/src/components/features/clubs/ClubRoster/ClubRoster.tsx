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
      <h2 id="roster-heading" className={styles.heading}>
        {t("roster.heading")}
      </h2>
      {players.length === 0 ? (
        <p className={styles.empty}>{t("roster.empty")}</p>
      ) : (
        <div className={styles.rosterContainer}>
          {/* Desktop Table View */}
          <div className={styles.desktopView}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colNumber}>{t("roster.tableHeaders.number")}</th>
                  <th className={styles.colName}>{t("roster.tableHeaders.name")}</th>
                  <th className={styles.colPosition}>{t("roster.tableHeaders.position")}</th>
                  <th className={styles.colDob}>{t("roster.tableHeaders.dateOfBirth")}</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => (
                  <tr key={player.id || idx}>
                    <td className={styles.colNumber}>
                      {player.jersey_number ? `#${player.jersey_number}` : idx + 1}
                    </td>
                    <td className={styles.colName}>
                      <span className={styles.playerName}>{player.name}</span>
                    </td>
                    <td className={styles.colPosition}>{player.position || "—"}</td>
                    <td className={styles.colDob}>{player.date_of_birth || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <ul className={styles.mobileView}>
            {players.map((player, idx) => (
              <li key={player.id || idx} className={styles.mobileCard}>
                <div className={styles.mobileHeader}>
                  <span className={styles.playerName}>{player.name}</span>
                  {player.jersey_number && (
                    <span className={styles.jerseyNumber}>#{player.jersey_number}</span>
                  )}
                </div>
                {(player.position || player.date_of_birth) && (
                  <div className={styles.mobileMeta}>
                    {player.position && (
                      <span className={styles.playerPosition}>{player.position}</span>
                    )}
                    {player.date_of_birth && (
                      <span className={styles.playerDob}>{player.date_of_birth}</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
