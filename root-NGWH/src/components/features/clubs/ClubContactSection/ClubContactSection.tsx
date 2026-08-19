import React from "react";
import { getTranslations } from "next-intl/server";
import { formatTextListField } from "../../../../utils/clubFields";
import styles from "./ClubContactSection.module.scss";

interface ClubContactSectionProps {
  contactInfo: unknown;
  socialLinks: unknown;
}

export async function ClubContactSection({ contactInfo, socialLinks }: ClubContactSectionProps) {
  const t = await getTranslations("clubs.profile");
  const contacts = formatTextListField(contactInfo);
  const socials = formatTextListField(socialLinks);

  return (
    <section className={styles.section} aria-labelledby="contact-heading">
      <h2 id="contact-heading" className={styles.heading}>{t("contact.heading")}</h2>
      
      <div className={styles.grid}>
        <div className={styles.column}>
          <h3 className={styles.subheading}>{t("contact.contactHeading")}</h3>
          {contacts.length === 0 ? (
            <p className={styles.empty}>{t("contact.contactEmpty")}</p>
          ) : (
            <div className={styles.content}>
              {contacts.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          )}
        </div>

        <div className={styles.column}>
          <h3 className={styles.subheading}>{t("contact.socialHeading")}</h3>
          {socials.length === 0 ? (
            <p className={styles.empty}>{t("contact.socialEmpty")}</p>
          ) : (
            <ul className={styles.socialList}>
              {socials.map((item, index) => {
                // If it looks like a URL, render as a link
                const isUrl = /^https?:\/\//i.test(item);
                if (isUrl) {
                  return (
                    <li key={index}>
                      <a href={item} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {item}
                      </a>
                    </li>
                  );
                }
                // Otherwise render as text
                return <li key={index}>{item}</li>;
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
