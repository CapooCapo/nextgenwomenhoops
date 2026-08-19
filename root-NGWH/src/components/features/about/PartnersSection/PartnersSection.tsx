import React from "react";
import { getTranslations } from "next-intl/server";
import { getPartners } from "../../../../services/contentService";
import { Partner } from "../../../../types/content";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { PartnerCard } from "../PartnerCard/PartnerCard";
import styles from "./PartnersSection.module.scss";

export async function PartnersSection() {
  const t = await getTranslations("about.partners");
  let partners: Partner[] = [];
  let error = false;

  try {
    partners = getPartners();
  } catch {
    error = true;
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="partners-heading">
        <Container>
          <h2 id="partners-heading" className={styles.heading}>{t("heading")}</h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="partners-heading">
      <Container>
        <h2 id="partners-heading" className={styles.heading}>{t("heading")}</h2>
        
        {partners.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <div className={styles.grid}>
            {partners.map((partner, index) => (
              <PartnerCard key={index} partner={partner} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
