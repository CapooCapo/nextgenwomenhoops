import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Club } from "../../../../types/club";
import { formatAchievements } from "../../../../utils/clubFields";
import styles from "./ClubDirectoryList.module.scss";

interface ClubDirectoryListProps {
  clubs: Club[];
}

export async function ClubDirectoryList({ clubs }: ClubDirectoryListProps) {
  const t = await getTranslations("clubs.directory");

  if (clubs.length === 0) {
    return <p className={styles.empty}>{t("empty")}</p>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("tableHeaders.logo", { fallback: "Logo" })}</th>
            <th>{t("tableHeaders.name", { fallback: "Club" })}</th>
            <th>{t("tableHeaders.region", { fallback: "Province / Region" })}</th>
            <th>{t("tableHeaders.foundingYear", { fallback: "Founded" })}</th>
            <th>{t("tableHeaders.achievements", { fallback: "Achievements" })}</th>
            <th>{t("tableHeaders.actions", { fallback: "Action" })}</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => {
            const achievementItems = formatAchievements(club.achievements);
            const achievementSummary = achievementItems
              .map((a) => (a.year ? `${a.title} (${a.year})` : a.title))
              .join(" · ");

            return (
              <tr key={club.id}>
                <td>
                  <div className={styles.logoWrapper}>
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} className={styles.logo} loading="lazy" />
                    ) : (
                      <div className={styles.fallbackLogo}>
                        <span>{club.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.clubName}>{club.name}</div>
                </td>
                <td>
                  <span className={styles.region}>{club.province_region}</span>
                </td>
                <td>
                  <span className={styles.year}>{club.founding_year || "-"}</span>
                </td>
                <td>
                  <div className={styles.achievements}>
                    {achievementSummary || "-"}
                  </div>
                </td>
                <td>
                  <Link href={`/clubs/${club.id}`} className={styles.actionBtn}>
                    {t("viewDetails", { fallback: "View Details" })}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
