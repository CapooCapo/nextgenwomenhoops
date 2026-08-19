import React from "react";
import { getTranslations } from "next-intl/server";
import { ClubRosterMember } from "../../../../types/club";
import styles from "./ClubCoachingStaff.module.scss";

interface ClubCoachingStaffProps {
  coachStaff: ClubRosterMember[];
}

export async function ClubCoachingStaff({ coachStaff }: ClubCoachingStaffProps) {
  const t = await getTranslations("clubs.profile");

  return (
    <section className={styles.section} aria-labelledby="coaching-staff-heading">
      <h2 id="coaching-staff-heading" className={styles.heading}>{t("coachingStaff.heading")}</h2>
      {coachStaff.length === 0 ? (
        <p className={styles.empty}>{t("coachingStaff.empty")}</p>
      ) : (
        <ul className={styles.grid}>
          {coachStaff.map((coach) => (
            <li key={coach.id} className={styles.item}>
              {coach.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
