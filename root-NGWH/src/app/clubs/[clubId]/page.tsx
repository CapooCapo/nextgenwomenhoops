import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage";
import { ClubProfileHeader } from "@/components/features/clubs/ClubProfileHeader/ClubProfileHeader";
import { ClubAchievements } from "@/components/features/clubs/ClubAchievements/ClubAchievements";
import { ClubRoster } from "@/components/features/clubs/ClubRoster/ClubRoster";
import { ClubCoachingStaff } from "@/components/features/clubs/ClubCoachingStaff/ClubCoachingStaff";
import { ClubContactSection } from "@/components/features/clubs/ClubContactSection/ClubContactSection";
import { getClubById } from "@/services/clubsService";
import type { ClubDetail } from "@/types/club";
import styles from "./page.module.scss";

interface ClubProfilePageProps {
  params: Promise<{ clubId: string }>;
}

// Sprint 2 Batch 4 — REQ-CLUB-003 (display gate)/004/005/006. See
// .ai/lld/club-profile.md. A club that doesn't exist or isn't approved
// both 404 identically (§10) — BR-001 never leaks approval state via a
// distinct message. A genuine fetch failure renders ErrorMessage instead
// (§10), matching ClubsPage's/ArticleDetail's existing pattern. Section
// components are invoked and awaited directly (not nested as JSX), the
// same async-Server-Component composition pattern already required by
// Home/News/About/Directory, since each is an async component.
export default async function ClubProfilePage({ params }: ClubProfilePageProps) {
  const { clubId } = await params;
  const t = await getTranslations();

  let club: ClubDetail | null;
  try {
    club = await getClubById(clubId);
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

  return (
    <Container>
      <div className={styles.page}>
        {await ClubProfileHeader({ club })}
        {await ClubAchievements({ achievements: club.achievements })}
        {await ClubRoster({ players: club.players })}
        {await ClubCoachingStaff({ coachStaff: club.coach_staff })}
        {await ClubContactSection({
          contactInfo: club.contact_info,
          socialLinks: club.social_links,
        })}
      </div>
    </Container>
  );
}
