import { getFormatter, getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card/Card";
import { Container } from "@/components/ui/Container/Container";
import { ErrorMessage } from "@/components/ui/ErrorMessage/ErrorMessage";
import { getMatchesList } from "@/server/services/matchesServerService";
import type { Match, MatchStatus } from "@/types/tournament";
import styles from "./ScheduleTable.module.scss";

/**
 * REQ-TOURN-001 (.ai/lld/tournaments.md §6/§8). Named `ScheduleTable`
 * per `ARCHITECTURE.md` §4's reserved component name; the actual DOM is
 * a stacked list of cards, not a literal `<table>` — same naming-vs-
 * markup gap already accepted for `ClubDirectoryList` (a CSS grid, not
 * a `<ul>`), chosen for responsive/accessibility reasons a data table
 * doesn't give for free at narrow widths.
 *
 * Self-contained fetch/empty/error, matching `ArticleList`/`HotNewsList`'s
 * pattern — not `ClubsPage`'s shared-fetch pattern, since Schedule and
 * Archives share no data (.ai/lld/tournaments.md §8, "Corrected during
 * implementation").
 */
export async function ScheduleTable() {
  const t = await getTranslations();
  const formatter = await getFormatter();

  let matches: Match[] = [];
  let loadFailed = false;
  try {
    const list = await getMatchesList();
    matches = list.map((m) => ({
      ...m,
      status: m.status as MatchStatus,
    }));
  } catch {
    loadFailed = true;
  }

  return (
    <section className={styles.section}>
      <Container>
        <h2 className={styles.heading}>{t("tournaments.schedule.heading")}</h2>

        {loadFailed && <ErrorMessage message={t("tournaments.schedule.error")} />}

        {!loadFailed && matches.length === 0 && (
          <p className={styles.empty}>{t("tournaments.schedule.empty")}</p>
        )}

        {!loadFailed && matches.length > 0 && (
          <ul className={styles.list}>
            {matches.map((match) => (
              <li key={match.id}>
                <Card className={styles.card}>
                  <div className={styles.matchMain}>
                    <div className={`${styles.team} ${styles.teamHome}`}>
                      <span className={styles.teamName}>{match.home_club.name}</span>
                      {match.home_club.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={styles.teamLogo} src={match.home_club.logo} alt="" />
                      )}
                    </div>
                    <div className={styles.vsBadge} aria-hidden="true">
                      {/* For now, text "VS". Can be replaced with an icon if desired */}
                      {t("tournaments.schedule.vs")}
                    </div>
                    <div className={`${styles.team} ${styles.teamAway}`}>
                      {match.away_club.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={styles.teamLogo} src={match.away_club.logo} alt="" />
                      )}
                      <span className={styles.teamName}>{match.away_club.name}</span>
                    </div>
                  </div>

                  <div className={styles.matchMeta}>
                    <div className={styles.metaLeft}>
                      <span className={styles.dateTime}>
                        {formatter.dateTime(new Date(match.scheduled_at), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      {match.venue && (
                        <>
                          <span className={styles.metaDivider}>•</span>
                          <span className={styles.venue}>{match.venue}</span>
                        </>
                      )}
                    </div>
                    <div className={styles.metaRight}>
                      <span className={`${styles.status} ${styles[`status_${match.status}`]}`}>
                        {t(`tournaments.schedule.status.${match.status}`)}
                      </span>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
