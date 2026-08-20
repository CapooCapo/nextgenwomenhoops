import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserSession } from "@/server/auth/userAuth";
import { getClubDetailForView } from "@/server/services/clubsServerService";
import { Container } from "@/components/ui/Container/Container";
import { EditClubForm } from "./EditClubForm";
import styles from "./editClub.module.scss";

export const metadata = {
  title: "NextGen Women Hoops | Edit Club",
  description: "Update club profile information",
};

export default async function EditClubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, t] = await Promise.all([
    getUserSession(),
    getTranslations("clubs.edit"),
  ]);

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    notFound();
  }

  const club = await getClubDetailForView(numId, session.user.id, false);
  if (!club) {
    notFound();
  }

  // Authorization Enforcement: Server-side check
  if (club.user_id !== session.user.id) {
    return (
      <main className={styles.main}>
        <Container className={styles.container}>
          <div className={styles.accessDeniedCard}>
            <h2>{t("accessDeniedTitle")}</h2>
            <p>{t("accessDeniedBody")}</p>
            <Link href="/account/clubs" className={styles.backBtn}>
              {t("backToMyClubs")}
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Container className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>
            {t("subtitle", { name: club.name })}
          </p>
        </div>

        <div className={styles.formCard}>
          <EditClubForm club={club} />
        </div>
      </Container>
    </main>
  );
}
