import React from "react";
import Link from "next/link";
import { Club } from "../../../../types/club";
import { Card } from "../../../ui/Card/Card";
import styles from "./ClubCard.module.scss";

interface ClubCardProps {
  club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
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
          <h3 className={styles.name}>{club.name}</h3>
          
          <div className={styles.meta}>
            <span className={styles.region}>{club.province_region}</span>
            {club.founding_year && (
              <>
                <span className={styles.dot} aria-hidden="true">&bull;</span>
                <span className={styles.year}>{club.founding_year}</span>
              </>
            )}
          </div>
          
          {!!club.achievements && (
            <p className={styles.achievements}>
              {String(club.achievements)}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
