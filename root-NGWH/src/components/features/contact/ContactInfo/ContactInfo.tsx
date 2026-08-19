import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage";
import { getContactInfo } from "@/services/contentService";
import type { ContactInfo as ContactInfoData, LocalizedText } from "@/types/content";
import styles from "./ContactInfo.module.scss";

/**
 * REQ-CONTACT-001 (.ai/lld/contact.md §3/§4). No office address, hotline,
 * or support email is confirmed anywhere in the requirements workbook —
 * only the categories required are named, not actual values — so this
 * renders its designed empty state rather than fabricating one (RULES.md
 * R006), matching the exact precedent already established by
 * ChampionsCorner/PartnersSection/every Gallery section.
 */
function getLocalizedValue(
  val: LocalizedText | string | undefined,
  locale: "en" | "vi",
): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] || val.en || "";
}

function isEmailLink(val: string): boolean {
  return val.includes("@") && !val.startsWith("[");
}

function isPhoneLink(val: string): boolean {
  return (val.startsWith("+") || /^\d/.test(val)) && !val.startsWith("[");
}

export async function ContactInfo() {
  const t = await getTranslations();
  const locale = (await getLocale()) as "en" | "vi";

  let info: ContactInfoData | null = null;
  let loadFailed = false;
  try {
    info = getContactInfo();
  } catch {
    loadFailed = true;
  }

  const hasContent =
    !!info &&
    (!!info.officeAddress || !!info.hotline || (info.supportEmails?.length ?? 0) > 0);

  return (
    <section className={styles.section}>
      <Container>
        <h2 className={styles.heading}>{t("contact.info.heading")}</h2>

        {loadFailed && <ErrorMessage message={t("contact.info.error")} />}

        {!loadFailed && !hasContent && (
          <p className={styles.empty}>{t("contact.info.empty")}</p>
        )}

        {!loadFailed && hasContent && info && (
          <dl className={styles.grid}>
            {info.officeAddress && (
              <div className={styles.card}>
                <dt className={styles.label}>{t("contact.info.officeAddressLabel")}</dt>
                <dd className={styles.value}>
                  {getLocalizedValue(info.officeAddress, locale).startsWith("[") ? (
                    <span className={styles.placeholder}>
                      {getLocalizedValue(info.officeAddress, locale)}
                    </span>
                  ) : (
                    getLocalizedValue(info.officeAddress, locale)
                  )}
                </dd>
              </div>
            )}

            {info.hotline && (
              <div className={styles.card}>
                <dt className={styles.label}>{t("contact.info.hotlineLabel")}</dt>
                <dd className={styles.value}>
                  {isPhoneLink(getLocalizedValue(info.hotline, locale)) ? (
                    <a
                      href={`tel:${getLocalizedValue(info.hotline, locale)}`}
                      className={styles.link}
                    >
                      {getLocalizedValue(info.hotline, locale)}
                    </a>
                  ) : (
                    <span className={styles.placeholder}>
                      {getLocalizedValue(info.hotline, locale)}
                    </span>
                  )}
                </dd>
              </div>
            )}

            {info.supportEmails?.map((entry, index) => {
              const emailVal = getLocalizedValue(entry.email, locale);
              const labelVal = getLocalizedValue(entry.label, locale);
              return (
                <div className={styles.card} key={index}>
                  <dt className={styles.label}>{labelVal}</dt>
                  <dd className={styles.value}>
                    {isEmailLink(emailVal) ? (
                      <a href={`mailto:${emailVal}`} className={styles.link}>
                        {emailVal}
                      </a>
                    ) : (
                      <span className={styles.placeholder}>{emailVal}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </Container>
    </section>
  );
}
