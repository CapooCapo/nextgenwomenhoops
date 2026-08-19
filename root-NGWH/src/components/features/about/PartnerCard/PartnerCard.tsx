import React from "react";
import { useLocale } from "next-intl";
import { Partner } from "../../../../types/content";
import { Card } from "../../../ui/Card/Card";
import styles from "./PartnerCard.module.scss";

interface PartnerCardProps {
  partner: Partner;
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const locale = useLocale() as "en" | "vi";

  return (
    <Card className={styles.card}>
      {partner.logo ? (
        <div className={styles.logoWrapper}>
          <img
            src={partner.logo.src}
            alt={partner.logo.alt[locale]}
            className={styles.logo}
            loading="lazy"
          />
        </div>
      ) : (
        <div className={styles.textOnlyFallback}>
          <span className={styles.name}>{partner.name[locale]}</span>
        </div>
      )}
      
      {/* If logo was present, we still render name visually hidden for a11y, but here we just render it below if we want. Requirement says "degrades to name-only when a logo is absent". I'll render the name below the logo always for clarity, or just rely on alt text. Let's render it visibly. */}
      {partner.logo && <div className={styles.name}>{partner.name[locale]}</div>}
      
      <div className={styles.role}>{partner.role[locale]}</div>
    </Card>
  );
}
