import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserSession } from "@/server/auth/userAuth";
import { Container } from "@/components/ui/Container/Container";
import styles from "./account.module.scss";

export async function generateMetadata() {
  const t = await getTranslations("account");
  return {
    title: `${t("title")} | NextGen Women Hoops`,
  };
}

export default async function AccountPage() {
  const session = await getUserSession();

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const t = await getTranslations("account");

  return (
    <main className={styles.main}>
      <Container className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.avatar}>
              {session.user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className={styles.title}>{t("title")}</h1>
              <p className={styles.subtitle}>{session.user.email}</p>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>{t("userId")}</span>
              <span className={styles.value}>#{session.user.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>{t("contactEmail")}</span>
              <span className={styles.value}>{session.user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>{t("accountType")}</span>
              <span className={styles.valueBadge}>
                {session.user.role === "admin" ? t("roleAdmin") : t("roleClub")}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/account/clubs" className={styles.primaryBtn}>
              {t("viewMyClubs")}
            </Link>
            <Link href="/club-registration" className={styles.secondaryBtn}>
              {t("registerNewClub")}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
