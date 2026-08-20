import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserSession } from "@/server/auth/userAuth";
import { Container } from "@/components/ui/Container/Container";
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage";
import { ClubProfileHeader } from "@/components/features/clubs/ClubProfileHeader/ClubProfileHeader";
import { ClubAchievements } from "@/components/features/clubs/ClubAchievements/ClubAchievements";
import { ClubRoster } from "@/components/features/clubs/ClubRoster/ClubRoster";
import { ClubCoachingStaff } from "@/components/features/clubs/ClubCoachingStaff/ClubCoachingStaff";
import { ClubContactSection } from "@/components/features/clubs/ClubContactSection/ClubContactSection";
import { getApprovedClubDetail } from "@/server/services/clubsServerService";
import type { ClubDetail } from "@/types/club";
import styles from "./page.module.scss";

interface ClubProfilePageProps {
  params: Promise<{ clubId: string }>;
}

export default async function ClubProfilePage({ params }: ClubProfilePageProps) {
  const { clubId } = await params;
  const [t, session] = await Promise.all([
    getTranslations(),
    getUserSession(),
  ]);

  const numericId = parseInt(clubId, 10);
  if (isNaN(numericId)) {
    notFound();
  }

  let club: ClubDetail | null;
  try {
    club = await getApprovedClubDetail(numericId);
  } catch {
    return (
      <Container>
        <ErrorMessage message={t("clubs.profile.error")} />
      </Container>
    );
  }

  if (!club) {
    notFound();
  }

  const isOwner = session.authenticated && session.user && club.user_id === session.user.id;

  return (
    <Container>
      <div className={styles.page}>
        {isOwner && (
          <div className={styles.ownerBanner}>
            <span>Bạn là người quản lý câu lạc bộ này</span>
            <Link
              href={`/account/clubs/${club.id}/edit`}
              className={styles.editClubBtn}
            >
              ✏️ Chỉnh sửa CLB
            </Link>
          </div>
        )}
        {await ClubProfileHeader({ club })}
        {await ClubAchievements({ achievements: club.achievements })}
        {await ClubRoster({ players: club.players })}
        {await ClubCoachingStaff({ coachStaff: club.coach_staff })}
        {await ClubContactSection({
          contactInfo: club.contact_info,
          socialLinks: club.social_links,
        })}
        {(club.capability_profile || club.u20_athlete_list) && (
          <section className={styles.documentsSection}>
            <h2 className={styles.sectionTitle}>
              {t("clubs.profile.documents.heading")}
            </h2>
            <div className={styles.documentGrid}>
              {club.capability_profile && (
                <div className={styles.documentCard}>
                  <h3 className={styles.documentCardTitle}>
                    {t("clubs.profile.documents.capabilityProfile")}
                  </h3>
                  <a
                    href={club.capability_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.documentLink}
                  >
                    {t("clubs.profile.documents.viewDocument")}
                  </a>
                </div>
              )}
              {club.u20_athlete_list && (
                <div className={styles.documentCard}>
                  <h3 className={styles.documentCardTitle}>
                    {t("clubs.profile.documents.u20AthleteList")}
                  </h3>
                  <a
                    href={club.u20_athlete_list}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.documentLink}
                  >
                    {t("clubs.profile.documents.viewDocument")}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
