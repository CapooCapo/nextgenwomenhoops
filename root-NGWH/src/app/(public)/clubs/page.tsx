import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage";
import { ClubDirectoryFilter } from "@/components/features/clubs/ClubDirectoryFilter/ClubDirectoryFilter";
import { ClubDirectoryList } from "@/components/features/clubs/ClubDirectoryList/ClubDirectoryList";
import { ClubPagination } from "@/components/features/clubs/ClubPagination/ClubPagination";
import { getApprovedClubsList } from "@/server/services/clubsServerService";
import type { PaginatedClubsResponse } from "@/types/club";
import styles from "./page.module.scss";

interface ClubsPageProps {
  searchParams: Promise<{ region?: string; search?: string; page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("pages.clubs.title");
  const description = t("seo.clubs.description");

  return {
    title,
    description,
    // Always canonicalize to the unfiltered directory — region/search/page
    // query params must not produce distinct canonical URLs.
    alternates: { canonical: "/clubs" },
    openGraph: { title, description, url: "/clubs", type: "website" },
  };
}

export default async function ClubsPage({ searchParams }: ClubsPageProps) {
  const t = await getTranslations();
  const { region, search, page: pageStr } = await searchParams;
  const page = pageStr ? parseInt(pageStr, 10) || 1 : 1;

  let clubsData: PaginatedClubsResponse | null = null;
  let allClubsForRegions: PaginatedClubsResponse | null = null;
  let loadFailed = false;

  try {
    [clubsData, allClubsForRegions] = await Promise.all([
      getApprovedClubsList({ provinceRegion: region, search, page, limit: 9 }),
      getApprovedClubsList({ limit: 1000 }),
    ]);
  } catch {
    loadFailed = true;
  }

  const regions = allClubsForRegions
    ? Array.from(
        new Set(allClubsForRegions.data.map((club) => club.province_region)),
      ).sort()
    : [];

  const clubDirectoryList =
    loadFailed || !clubsData
      ? null
      : await ClubDirectoryList({ clubs: clubsData.data });

  return (
    <Container>
      <h1 className={styles.title}>{t("pages.clubs.title")}</h1>

      {!loadFailed && (
        <ClubDirectoryFilter
          regions={regions}
          selectedRegion={region}
          searchQuery={search}
        />
      )}

      {loadFailed && <ErrorMessage message={t("clubs.directory.error")} />}

      {clubDirectoryList}

      {!loadFailed && clubsData && (
        <ClubPagination
          currentPage={clubsData.pagination.page}
          totalPages={clubsData.pagination.totalPages}
        />
      )}
    </Container>
  );
}
