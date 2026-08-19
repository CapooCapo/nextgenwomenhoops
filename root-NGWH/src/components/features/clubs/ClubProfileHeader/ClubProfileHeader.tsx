import React from "react";
import { ClubDetail } from "../../../../types/club";
import styles from "./ClubProfileHeader.module.scss";

interface ClubProfileHeaderProps {
  club: ClubDetail;
}

export function ClubProfileHeader({ club }: ClubProfileHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.imageWrapper}>
        {club.logo ? (
          <img src={club.logo} alt={club.name} className={styles.logo} loading="eager" />
        ) : (
          <div className={styles.fallbackLogo}>
            <span>{club.name.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <h1 className={styles.name}>{club.name}</h1>
        <div className={styles.meta}>
          <span className={styles.region}>{club.province_region}</span>
          {club.founding_year && (
            <>
              <span className={styles.dot} aria-hidden="true">&bull;</span>
              <span className={styles.year}>{club.founding_year}</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
