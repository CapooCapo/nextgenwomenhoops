import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage";
import { ClubDirectoryFilter } from "@/components/features/clubs/ClubDirectoryFilter/ClubDirectoryFilter";
import { ClubDirectoryList } from "@/components/features/clubs/ClubDirectoryList/ClubDirectoryList";
import { getClubs } from "@/services/clubsService";
import type { Club } from "@/types/club";
import styles from "./page.module.scss";

interface ClubsPageProps {
  searchParams: Promise<{ region?: string }>;
}

// Sprint 2 Batch 3 — REQ-CLUB-001 (list slice)/REQ-CLUB-002. See
// .ai/lld/club-directory.md. Single content region: heading, region
// filter, club list — no map/list toggle (OQ-009 not resolved, §2/§7).
// Fetches the collection once and filters in memory — REQ-CLUB-002 only
// requires narrowing what's displayed, not a second network round trip.
// The backend's own `?province_region=` filter (.ai/lld/clubs.md §11)
// is unchanged and still available; this page just no longer needs it.
// ClubDirectoryList is invoked and awaited directly (not nested as
// `<ClubDirectoryList />` JSX) — same corrected async-Server-Component
// composition pattern already used by Home/News/About, since it's async.
export default async function ClubsPage({ searchParams }: ClubsPageProps) {
  const t = await getTranslations();
  const { region } = await searchParams;

  let allClubs: Club[] = [];
  let loadFailed = false;

  try {
    allClubs = await getClubs();
  } catch {
    loadFailed = true;
  }

  const regions = Array.from(
    new Set(allClubs.map((club) => club.province_region)),
  ).sort();

  const displayedClubs = region
    ? allClubs.filter((club) => club.province_region === region)
    : allClubs;

  const clubDirectoryList = loadFailed
    ? null
    : await ClubDirectoryList({ clubs: displayedClubs });

  return (
    <Container>
      <h1 className={styles.title}>{t("pages.clubs.title")}</h1>

      {!loadFailed && (
        <ClubDirectoryFilter regions={regions} selectedRegion={region} />
      )}

      {loadFailed && <ErrorMessage message={t("clubs.directory.error")} />}

      {clubDirectoryList}
    </Container>
  );
}
