import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ScheduleTable } from "@/components/features/tournaments/ScheduleTable/ScheduleTable";
import { ArchivesList } from "@/components/features/tournaments/ArchivesList/ArchivesList";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("pages.tournaments.title");
  const description = t("seo.tournaments.description");

  return {
    title,
    description,
    alternates: { canonical: "/tournaments" },
    openGraph: { title, description, url: "/tournaments", type: "website" },
  };
}

// Sprint 4 — REQ-TOURN-001 (schedule)/004 (archives). See
// .ai/lld/tournaments.md. REQ-TOURN-002 (standings)/003 (stats) remain
// out of scope — BLOCKED on OQ-005/OQ-007/OQ-008, not built here, not
// even as an inert shell.
export default async function TournamentsPage() {
  const t = await getTranslations();
  const [schedule, archives] = await Promise.all([ScheduleTable(), ArchivesList()]);

  return (
    <>
      <Container>
        <h1 className={styles.title}>{t("pages.tournaments.title")}</h1>
      </Container>
      {schedule}
      {archives}
    </>
  );
}
