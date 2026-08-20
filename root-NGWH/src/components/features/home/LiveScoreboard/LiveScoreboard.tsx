import React from "react";
import { getTranslations } from "next-intl/server";
import {
  getHomepageLiveScoreboardMatch,
  FormattedMatch,
} from "../../../../server/services/matchesServerService";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import styles from "./LiveScoreboard.module.scss";

export interface LiveScoreboardProps {
  initialMatch?: FormattedMatch | null;
  forceError?: boolean;
}

export function renderFouls(fouls: number | null | undefined, labelText: string) {
  if (fouls === null || fouls === undefined) {
    return null;
  }
  const count = Math.max(0, Math.min(5, Number(fouls) || 0));
  return (
    <div className={styles.foulsContainer} aria-label={`${labelText}: ${count}`}>
      <span className={styles.foulsLabel}>{labelText}</span>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`${styles.foulDot} ${i < count ? styles.active : ""}`}
        />
      ))}
    </div>
  );
}

export async function LiveScoreboard({
  initialMatch,
  forceError,
}: LiveScoreboardProps = {}) {
  const t = await getTranslations("home.scoreboard");
  let match: FormattedMatch | null = initialMatch !== undefined ? initialMatch : null;
  let error = Boolean(forceError);

  if (initialMatch === undefined && !forceError) {
    try {
      match = await getHomepageLiveScoreboardMatch();
    } catch (err) {
      if (process.env.NODE_ENV !== "test") {
        console.error("Failed to fetch live scoreboard match:", err);
      }
      error = true;
    }
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="live-scoreboard-heading">
        <Container>
          <h2 id="live-scoreboard-heading" className={styles.heading}>
            {t("heading")}
          </h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  const isLive =
    match?.status?.toLowerCase() === "live" ||
    match?.status?.toLowerCase() === "in_progress";
  const isFinished =
    match?.status?.toLowerCase() === "finished" ||
    match?.status?.toLowerCase() === "completed" ||
    match?.status?.toLowerCase() === "ended";

  return (
    <section className={styles.section} aria-labelledby="live-scoreboard-heading">
      <Container>
        <h2 id="live-scoreboard-heading" className={styles.heading}>
          {t("heading")}
        </h2>

        {!match ? (
          <div className={styles.emptyState}>
            <p>{t("empty")}</p>
          </div>
        ) : (
          <div className={styles.scoreboardContainer}>
            {/* Header row with status & venue/time */}
            <div className={styles.headerRow}>
              <div
                className={`${styles.statusBadge} ${
                  isLive
                    ? styles.live
                    : isFinished
                    ? styles.final
                    : styles.scheduled
                }`}
              >
                {isLive && <span className={styles.liveDot} />}
                <span>
                  {isLive
                    ? t("liveBadge")
                    : isFinished
                    ? t("finalBadge")
                    : t("scheduledBadge")}
                </span>
              </div>

              <div className={styles.venueTime}>
                {match.venue ? `${match.venue} • ` : ""}
                {new Date(match.scheduled_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Desktop Layout (> 767px) */}
            <div className={styles.desktopLayout}>
              {/* Home Team */}
              <div className={`${styles.teamSection} ${styles.home}`}>
                <div className={styles.teamInfo}>
                  <div className={styles.teamName}>{match.home_club.name}</div>
                  {renderFouls(match.home_fouls, t("foulsLabel"))}
                </div>
                <div className={styles.teamLogoWrapper}>
                  {match.home_club.logo ? (
                    <img
                      src={match.home_club.logo}
                      alt={match.home_club.name}
                      className={styles.teamLogo}
                    />
                  ) : (
                    <span className={styles.logoFallback}>
                      {match.home_club.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={styles.scoreDisplay}>
                  {match.home_score !== null && match.home_score !== undefined
                    ? match.home_score
                    : "--"}
                </div>
              </div>

              {/* Center section: timer/period */}
              <div className={styles.centerSection}>
                <span className={styles.divider}>VS</span>
                <div className={styles.clockPeriod}>
                  {isLive && match.timer && (
                    <div className={styles.timer}>{match.timer}</div>
                  )}
                  {match.period && (
                    <div className={styles.period}>{match.period}</div>
                  )}
                </div>
              </div>

              {/* Away Team */}
              <div className={`${styles.teamSection} ${styles.away}`}>
                <div className={styles.scoreDisplay}>
                  {match.away_score !== null && match.away_score !== undefined
                    ? match.away_score
                    : "--"}
                </div>
                <div className={styles.teamLogoWrapper}>
                  {match.away_club.logo ? (
                    <img
                      src={match.away_club.logo}
                      alt={match.away_club.name}
                      className={styles.teamLogo}
                    />
                  ) : (
                    <span className={styles.logoFallback}>
                      {match.away_club.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={styles.teamInfo}>
                  <div className={styles.teamName}>{match.away_club.name}</div>
                  {renderFouls(match.away_fouls, t("foulsLabel"))}
                </div>
              </div>
            </div>

            {/* Mobile Layout (<= 767px) */}
            <div className={styles.mobileLayout}>
              {/* Row 1: Teams & Logos */}
              <div className={styles.mobileTeamsRow}>
                {/* Home Team Cell */}
                <div className={styles.mobileTeamCell}>
                  <div className={styles.mobileLogoWrapper}>
                    {match.home_club.logo ? (
                      <img
                        src={match.home_club.logo}
                        alt={match.home_club.name}
                        className={styles.teamLogo}
                      />
                    ) : (
                      <span className={styles.logoFallback}>
                        {match.home_club.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className={styles.mobileTeamName}>{match.home_club.name}</span>
                </div>

                <div className={styles.mobileVsBadge}>VS</div>

                {/* Away Team Cell */}
                <div className={styles.mobileTeamCell}>
                  <div className={styles.mobileLogoWrapper}>
                    {match.away_club.logo ? (
                      <img
                        src={match.away_club.logo}
                        alt={match.away_club.name}
                        className={styles.teamLogo}
                      />
                    ) : (
                      <span className={styles.logoFallback}>
                        {match.away_club.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className={styles.mobileTeamName}>{match.away_club.name}</span>
                </div>
              </div>

              {/* Row 2: Scores */}
              <div className={styles.mobileScoreRow}>
                <span className={styles.mobileScoreNum}>
                  {match.home_score !== null && match.home_score !== undefined
                    ? match.home_score
                    : "--"}
                </span>
                <span className={styles.mobileScoreDash}>-</span>
                <span className={styles.mobileScoreNum}>
                  {match.away_score !== null && match.away_score !== undefined
                    ? match.away_score
                    : "--"}
                </span>
              </div>

              {/* Row 3: Timer & Period / Match Ended Message */}
              <div className={styles.mobileClockRow}>
                {isLive && (
                  <div className={styles.mobileClockPeriod}>
                    {match.timer && <span className={styles.mobileTimer}>{match.timer}</span>}
                    {match.timer && match.period && (
                      <span className={styles.mobileDotSep}>•</span>
                    )}
                    {match.period && (
                      <span className={styles.mobilePeriod}>{match.period}</span>
                    )}
                  </div>
                )}
                {isFinished && (
                  <div className={styles.mobileMatchEnded}>
                    {t("finalBadge")}
                  </div>
                )}
                {!isLive && !isFinished && match.period && (
                  <div className={styles.mobilePeriod}>{match.period}</div>
                )}
              </div>

              {/* Row 4: Fouls Bar */}
              <div className={styles.mobileFoulsRow}>
                <div className={styles.mobileFoulsGroup}>
                  {renderFouls(match.home_fouls, t("foulsLabel"))}
                </div>
                <div className={styles.mobileFoulsGroup}>
                  {renderFouls(match.away_fouls, t("foulsLabel"))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
