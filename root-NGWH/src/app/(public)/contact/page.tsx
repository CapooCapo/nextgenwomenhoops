import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ContactInfo } from "@/components/features/contact/ContactInfo/ContactInfo";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("pages.contact.title");
  const description = t("contact.hero.intro");

  return {
    title,
    description,
    alternates: { canonical: "/contact" },
    openGraph: { title, description, url: "/contact", type: "website" },
  };
}

// Post-Sprint-5 Backlog pickup — REQ-CONTACT-001 only. See
// .ai/lld/contact.md. REQ-CONTACT-002 (feedback form) remains out of
// scope — BLOCKED on OQ-014, not built even as a shell.
export default async function ContactPage() {
  const t = await getTranslations();
  const contactInfo = await ContactInfo();

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.heroSection}>
        <Container>
          <h1 className={styles.title}>{t("contact.hero.title")}</h1>
          <p className={styles.intro}>{t("contact.hero.intro")}</p>
        </Container>
      </header>

      {contactInfo}

      <section className={styles.guidanceSection}>
        <Container>
          <div className={styles.guidanceCard}>
            <h2 className={styles.guidanceHeading}>{t("contact.guidance.heading")}</h2>
            <p className={styles.guidanceBody}>{t("contact.guidance.body")}</p>
            <p className={styles.guidanceNotice}>{t("contact.guidance.notice")}</p>
          </div>
        </Container>
      </section>
    </div>
  );
}
