import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage";
import { getSeasonsList } from "@/server/services/seasonsServerService";
import type { Season } from "@/types/tournament";
import styles from "./ArchivesList.module.scss";

/**
 * REQ-TOURN-004 (.ai/lld/tournaments.md §5/§6/§8). Named `ArchivesList`
 * per `ARCHITECTURE.md` §4's reserved component name. Literal scope
 * only — a bare list of season years, nothing else
 * (`SPRINT_PLAN.md`'s own explicit warning against expanding Archives
 * into per-season stats/media). No detail page, no click-through.
 */
export async function ArchivesList() {
  const t = await getTranslations();

  let seasons: Season[] = [];
  let loadFailed = false;
  try {
    seasons = await getSeasonsList();
  } catch {
    loadFailed = true;
  }

  return (
    <section className={styles.section}>
      <Container>
        <h2 className={styles.heading}>{t("tournaments.archives.heading")}</h2>

        {loadFailed && <ErrorMessage message={t("tournaments.archives.error")} />}

        {!loadFailed && seasons.length === 0 && (
          <p className={styles.empty}>{t("tournaments.archives.empty")}</p>
        )}

        {!loadFailed && seasons.length > 0 && (
          <ul className={styles.list}>
            {seasons.map((season) => (
              <li key={season.id} className={styles.item}>
                {t("tournaments.archives.seasonLabel", { year: season.year })}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
