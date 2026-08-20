import React from "react";
import { getTranslations } from "next-intl/server";
import { ClubCoachingStaffMember } from "../../../../types/club";
import styles from "./ClubCoachingStaff.module.scss";

interface ClubCoachingStaffProps {
  coachStaff: ClubCoachingStaffMember[];
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
          {coachStaff.map((coach, idx) => (
            <li key={coach.id || idx} className={styles.item}>
              <div className={styles.coachHeader}>
                <span className={styles.coachName}>{coach.name}</span>
                {coach.role && (
                  <span className={styles.coachRole}>{coach.role}</span>
                )}
              </div>
              {coach.description && (
                <p className={styles.coachDescription}>{coach.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
