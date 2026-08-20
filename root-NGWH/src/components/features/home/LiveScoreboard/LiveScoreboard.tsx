import React from "react";
import { getTranslations } from "next-intl/server";
import {
  getHomepageLiveScoreboardMatch,
  FormattedMatch,
} from "../../../../server/services/matchesServerService";
import {
  LiveScoreboardClient,
  renderFouls,
} from "./LiveScoreboardClient";

export { renderFouls };

export interface LiveScoreboardProps {
  initialMatch?: FormattedMatch | null;
  forceError?: boolean;
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

  const labels = {
    heading: t("heading"),
    liveBadge: t("liveBadge"),
    finalBadge: t("finalBadge"),
    scheduledBadge: t("scheduledBadge"),
    foulsLabel: t("foulsLabel"),
    empty: t("empty"),
    error: t("error"),
  };

  return (
    <LiveScoreboardClient
      initialMatch={match}
      forceError={error}
      labels={labels}
    />
  );
}
