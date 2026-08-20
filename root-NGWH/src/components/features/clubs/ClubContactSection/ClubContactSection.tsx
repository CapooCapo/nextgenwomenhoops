import React from "react";
import { getTranslations } from "next-intl/server";
import { formatContactInfo, formatSocialLinks } from "../../../../utils/clubFields";
import styles from "./ClubContactSection.module.scss";

interface ClubContactSectionProps {
  contactInfo: unknown;
  socialLinks: unknown;
}

export async function ClubContactSection({ contactInfo, socialLinks }: ClubContactSectionProps) {
  const t = await getTranslations("clubs.profile");
  const parsedContact = formatContactInfo(contactInfo);
  const parsedSocial = formatSocialLinks(socialLinks);

  const hasContact = Boolean(
    parsedContact.email ||
    parsedContact.phone ||
    parsedContact.website ||
    parsedContact.address ||
    parsedContact.raw_string
  );

  const socialPlatforms = [
    { key: "facebook", name: "Facebook", url: parsedSocial.facebook },
    { key: "instagram", name: "Instagram", url: parsedSocial.instagram },
    { key: "tiktok", name: "TikTok", url: parsedSocial.tiktok },
    { key: "youtube", name: "YouTube", url: parsedSocial.youtube },
  ].filter((p): p is { key: string; name: string; url: string } => Boolean(p.url && p.url.trim()));

  const legacySocials = parsedSocial.legacyList || [];
  const hasSocial = socialPlatforms.length > 0 || legacySocials.length > 0;

  return (
    <section className={styles.section} aria-labelledby="contact-heading">
      <h2 id="contact-heading" className={styles.heading}>{t("contact.heading")}</h2>
      
      <div className={styles.grid}>
        <div className={styles.column}>
          <h3 className={styles.subheading}>{t("contact.contactHeading")}</h3>
          {!hasContact ? (
            <p className={styles.empty}>{t("contact.contactEmpty")}</p>
          ) : (
            <div className={styles.content}>
              {parsedContact.raw_string && <p>{parsedContact.raw_string}</p>}
              {parsedContact.email && (
                <p>
                  <strong>{t("contact.labels.email")}:</strong>{" "}
                  <a href={`mailto:${parsedContact.email}`} className={styles.link}>
                    {parsedContact.email}
                  </a>
                </p>
              )}
              {parsedContact.phone && (
                <p>
                  <strong>{t("contact.labels.phone")}:</strong>{" "}
                  <a href={`tel:${parsedContact.phone}`} className={styles.link}>
                    {parsedContact.phone}
                  </a>
                </p>
              )}
              {parsedContact.website && (
                <p>
                  <strong>{t("contact.labels.website")}:</strong>{" "}
                  <a
                    href={parsedContact.website.startsWith("http") ? parsedContact.website : `https://${parsedContact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {parsedContact.website}
                  </a>
                </p>
              )}
              {parsedContact.address && (
                <p>
                  <strong>{t("contact.labels.address")}:</strong> {parsedContact.address}
                </p>
              )}
            </div>
          )}
        </div>

        <div className={styles.column}>
          <h3 className={styles.subheading}>{t("contact.socialHeading")}</h3>
          {!hasSocial ? (
            <p className={styles.empty}>{t("contact.socialEmpty")}</p>
          ) : (
            <ul className={styles.socialList}>
              {socialPlatforms.map((platform) => {
                const href = platform.url.startsWith("http") ? platform.url : `https://${platform.url}`;
                return (
                  <li key={platform.key}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {platform.name}: {platform.url}
                    </a>
                  </li>
                );
              })}
              {legacySocials.map((item, index) => {
                const isUrl = /^https?:\/\//i.test(item);
                if (isUrl) {
                  return (
                    <li key={`legacy-${index}`}>
                      <a href={item} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {item}
                      </a>
                    </li>
                  );
                }
                return <li key={`legacy-${index}`}>{item}</li>;
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
