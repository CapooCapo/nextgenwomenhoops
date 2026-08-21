import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Club } from "../../../../types/club";
import { Card } from "../../../ui/Card/Card";
import styles from "./ClubCard.module.scss";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
  const t = useTranslations("clubs.directory");

  return (
    <Link href={`/clubs/${club.id}`} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.imageWrapper}>
          {club.logo ? (
            <img src={club.logo} alt={club.name} className={styles.logo} loading="lazy" />
          ) : (
            <div className={styles.fallbackLogo}>
              <span>{club.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className={styles.content}>
          <table className={styles.infoTable}>
            <tbody>
              <tr>
                <td colSpan={2}>
                  <h3 className={styles.name}>{club.name}</h3>
                </td>
              </tr>
              <tr>
                <td className={styles.tableLabel}>{t("foundingYear")}:</td>
                <td className={styles.tableValue}>
                  {club.founding_year ? club.founding_year : t("noFoundingYear")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </Link>
  );
}
