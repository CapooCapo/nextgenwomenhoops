"use client";

import React, { useState, useEffect } from "react";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import styles from "./LiveScoreboard.module.scss";

export interface FormattedMatch {
  id: number;
  scheduled_at: string;
  venue: string | null;
  status: string;
  home_club: {
    id: number;
    name: string;
    logo: string | null;
  };
  away_club: {
    id: number;
    name: string;
    logo: string | null;
  };
  home_score?: number | null;
  away_score?: number | null;
  home_fouls?: number | null;
  away_fouls?: number | null;
  timer?: string | null;
  period?: string | null;
}

export function selectHomepageLiveMatch(matches: FormattedMatch[]): FormattedMatch | null {
  if (!matches || matches.length === 0) {
    return null;
  }

  // Policy 1: Show currently live match first
  const liveMatch = matches.find(
    (m) => m.status.toLowerCase() === "live" || m.status.toLowerCase() === "in_progress"
  );
  if (liveMatch) {
    return liveMatch;
  }

  // Policy 2: Show most recently finished match
  const finishedMatches = matches
    .filter(
      (m) =>
        m.status.toLowerCase() === "finished" ||
        m.status.toLowerCase() === "completed" ||
        m.status.toLowerCase() === "ended"
    )
    .sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
    );

  if (finishedMatches.length > 0) {
    return finishedMatches[0];
  }

  // Policy 3: If no live or finished match, show next upcoming scheduled match if present
  const scheduledMatches = matches
    .filter((m) => m.status.toLowerCase() === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

  if (scheduledMatches.length > 0) {
    return scheduledMatches[0];
  }

  return null;
}

export interface LiveScoreboardClientProps {
  initialMatch?: FormattedMatch | null;
  forceError?: boolean;
  labels: {
    heading: string;
    liveBadge: string;
    finalBadge: string;
    scheduledBadge: string;
    foulsLabel: string;
    empty: string;
    error: string;
  };
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

export function LiveScoreboardClient({
  initialMatch = null,
  forceError = false,
  labels,
}: LiveScoreboardClientProps) {
  const [match, setMatch] = useState<FormattedMatch | null>(initialMatch);
  const [hasError, setHasError] = useState<boolean>(forceError);
  const [homeLogoError, setHomeLogoError] = useState<boolean>(false);
  const [awayLogoError, setAwayLogoError] = useState<boolean>(false);

  const isLive =
    match?.status?.toLowerCase() === "live" ||
    match?.status?.toLowerCase() === "in_progress";
  const isFinished =
    match?.status?.toLowerCase() === "finished" ||
    match?.status?.toLowerCase() === "completed" ||
    match?.status?.toLowerCase() === "ended";

  useEffect(() => {
    if (forceError) return;

    let isMounted = true;
    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const fetchFallback = async () => {
      try {
        const res = await fetch("/api/matches", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) return;
        const matches: FormattedMatch[] = await res.json();
        const selected = selectHomepageLiveMatch(matches);
        if (isMounted) {
          setMatch(selected);
          setHomeLogoError(false);
          setAwayLogoError(false);
          setHasError(false);
        }
      } catch {
        // Silently preserve current state
      }
    };

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        eventSource = new EventSource("/api/matches/live-stream");

        eventSource.addEventListener("match_update", (event: MessageEvent) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setMatch(data.match);
            setHomeLogoError(false);
            setAwayLogoError(false);
            setHasError(false);
          } catch {
            // Ignore parse errors
          }
        });

        eventSource.onerror = () => {
          // If SSE encounters an error, start 15s fallback polling until reconnection succeeds
          if (!fallbackInterval) {
            fallbackInterval = setInterval(fetchFallback, 15000);
          }
        };
      } catch {
        fallbackInterval = setInterval(fetchFallback, 15000);
      }
    } else {
      // Fallback for environments without EventSource support
      fallbackInterval = setInterval(fetchFallback, 15000);
    }

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [forceError]);

  if (hasError) {
    return (
      <section className={styles.section} aria-labelledby="live-scoreboard-heading">
        <Container>
          <h2 id="live-scoreboard-heading" className={styles.heading}>
            {labels.heading}
          </h2>
          <ErrorMessage message={labels.error} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="live-scoreboard-heading">
      <Container>
        <h2 id="live-scoreboard-heading" className={styles.heading}>
          {labels.heading}
        </h2>

        {!match ? (
          <div className={styles.emptyState}>
            <p>{labels.empty}</p>
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
                    ? labels.liveBadge
                    : isFinished
                    ? labels.finalBadge
                    : labels.scheduledBadge}
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
                  {renderFouls(match.home_fouls, labels.foulsLabel)}
                </div>
                <div className={styles.teamLogoWrapper}>
                  {match.home_club.logo && !homeLogoError ? (
                    <img
                      src={match.home_club.logo}
                      alt={match.home_club.name}
                      className={styles.teamLogo}
                      onError={() => setHomeLogoError(true)}
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
                  {match.away_club.logo && !awayLogoError ? (
                    <img
                      src={match.away_club.logo}
                      alt={match.away_club.name}
                      className={styles.teamLogo}
                      onError={() => setAwayLogoError(true)}
                    />
                  ) : (
                    <span className={styles.logoFallback}>
                      {match.away_club.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={styles.teamInfo}>
                  <div className={styles.teamName}>{match.away_club.name}</div>
                  {renderFouls(match.away_fouls, labels.foulsLabel)}
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
                    {match.home_club.logo && !homeLogoError ? (
                      <img
                        src={match.home_club.logo}
                        alt={match.home_club.name}
                        className={styles.teamLogo}
                        onError={() => setHomeLogoError(true)}
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
                    {match.away_club.logo && !awayLogoError ? (
                      <img
                        src={match.away_club.logo}
                        alt={match.away_club.name}
                        className={styles.teamLogo}
                        onError={() => setAwayLogoError(true)}
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
                    {labels.finalBadge}
                  </div>
                )}
                {!isLive && !isFinished && match.period && (
                  <div className={styles.mobilePeriod}>{match.period}</div>
                )}
              </div>

              {/* Row 4: Fouls Bar */}
              <div className={styles.mobileFoulsRow}>
                <div className={styles.mobileFoulsGroup}>
                  {renderFouls(match.home_fouls, labels.foulsLabel)}
                </div>
                <div className={styles.mobileFoulsGroup}>
                  {renderFouls(match.away_fouls, labels.foulsLabel)}
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
