import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserSession } from "@/server/auth/userAuth";
import { getUserClubsList } from "@/server/services/clubsServerService";
import { Container } from "@/components/ui/Container/Container";
import styles from "./myClubs.module.scss";

export async function generateMetadata() {
  const t = await getTranslations("account.myClubs");
  return {
    title: `${t("title")} | NextGen Women Hoops`,
    description: t("subtitle"),
  };
}

export default async function MyClubsPage() {
  const session = await getUserSession();

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const t = await getTranslations("account.myClubs");
  const clubs = await getUserClubsList(session.user.id);

  return (
    <main className={styles.main}>
      <Container className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.subtitle}>{t("subtitle")}</p>
          </div>
          <Link href="/club-registration" className={styles.registerBtn}>
            {t("registerBtn")}
          </Link>
        </div>

        {clubs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏀</div>
            <h2 className={styles.emptyTitle}>{t("emptyTitle")}</h2>
            <p className={styles.emptyText}>{t("emptyText")}</p>
            <Link href="/club-registration" className={styles.ctaBtn}>
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <div className={styles.clubsGrid}>
            {clubs.map((club) => (
              <div key={club.id} className={styles.clubCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.logoWrapper}>
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className={styles.clubLogo}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>🏀</div>
                    )}
                  </div>
                  <div className={styles.cardHeaderInfo}>
                    <h3 className={styles.clubName}>{club.name}</h3>
                    <span className={styles.region}>{club.province_region}</span>
                  </div>
                  <span
                    className={`${styles.statusBadge} ${
                      club.is_approved ? styles.approved : styles.pending
                    }`}
                  >
                    {club.is_approved ? t("statusApproved") : t("statusPending")}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t("representative")}</span>
                    <span className={styles.infoValue}>
                      {club.representative_name}
                    </span>
                  </div>
                  {club.founding_year && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{t("foundingYear")}</span>
                      <span className={styles.infoValue}>
                        {club.founding_year}
                      </span>
                    </div>
                  )}

                  <div className={styles.docsSection}>
                    <span className={styles.docsTitle}>{t("attachedDocs")}</span>
                    <div className={styles.docsLinks}>
                      {club.capability_profile ? (
                        <a
                          href={club.capability_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          {t("capabilityProfile")}
                        </a>
                      ) : (
                        <span className={styles.noDoc}>{t("noCapabilityProfile")}</span>
                      )}
                      {club.u20_athlete_list ? (
                        <a
                          href={club.u20_athlete_list}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          {t("u20AthleteList")}
                        </a>
                      ) : (
                        <span className={styles.noDoc}>{t("noU20AthleteList")}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <Link
                    href={`/clubs/${club.id}`}
                    className={styles.viewBtn}
                  >
                    {t("viewProfile")}
                  </Link>
                  <Link
                    href={`/account/clubs/${club.id}/edit`}
                    className={styles.editBtn}
                  >
                    {t("editClub")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
