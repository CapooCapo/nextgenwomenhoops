import React from "react";
import { getTranslations } from "next-intl/server";
import { Club } from "../../../../types/club";
import { ClubCard } from "../ClubCard/ClubCard";
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
    <div className={styles.grid}>
      {clubs.map((club) => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}
