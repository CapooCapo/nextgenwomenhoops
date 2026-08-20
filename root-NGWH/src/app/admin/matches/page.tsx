"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface MatchItem {
  id: number;
  scheduled_at: string;
  venue: string | null;
  status: string;
  home_club_id: number;
  home_club_name: string;
  home_club_logo?: string | null;
  away_club_id: number;
  away_club_name: string;
  away_club_logo?: string | null;
  home_score?: number | null;
  away_score?: number | null;
  home_fouls?: number | null;
  away_fouls?: number | null;
  timer?: string | null;
  period?: string | null;
}

interface SeasonSimple {
  id: number;
  year: number;
}

interface ClubSimple {
  id: number;
  name: string;
  logo?: string | null;
}

export default function AdminMatchesPage() {
  const t = useTranslations("admin.matches");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [seasons, setSeasons] = useState<SeasonSimple[]>([]);
  const [clubs, setClubs] = useState<ClubSimple[]>([]);
  const [loading, setLoading] = useState(true);

  // Active match control state
  const [activeControlMatchId, setActiveControlMatchId] = useState<number | null>(null);

  // Match Form State (for creation)
  const [seasonId, setSeasonId] = useState<number | "">("");
  const [homeClubId, setHomeClubId] = useState<number | "">("");
  const [awayClubId, setAwayClubId] = useState<number | "">("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");

  // Inline Season Creation State
  const [showNewSeasonForm, setShowNewSeasonForm] = useState(false);
  const [newSeasonYear, setNewSeasonYear] = useState(new Date().getFullYear().toString());
  const [creatingSeason, setCreatingSeason] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [resM, resS, resC] = await Promise.all([
        fetch("/api/admin/matches"),
        fetch("/api/admin/seasons"),
        fetch("/api/admin/clubs"),
      ]);

      if (resM.ok) {
        const data = await resM.json();
        const mList: MatchItem[] = data.matches || [];
        setMatches(mList);
        if (mList.length > 0 && activeControlMatchId === null) {
          setActiveControlMatchId(mList[0].id);
        }
      }
      if (resS.ok) {
        const data = await resS.json();
        const seasonList: SeasonSimple[] = data.seasons || [];
        setSeasons(seasonList);
        if (seasonList.length > 0 && !seasonId) {
          setSeasonId(seasonList[0].id);
        }
      }
      if (resC.ok) {
        const data = await resC.json();
        const clubList: ClubSimple[] = data.clubs || [];
        setClubs(clubList);
        if (clubList.length > 1) {
          if (!homeClubId) setHomeClubId(clubList[0].id);
          if (!awayClubId) setAwayClubId(clubList[1].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/matches"),
      fetch("/api/admin/seasons"),
      fetch("/api/admin/clubs"),
    ])
      .then(async ([resM, resS, resC]) => {
        const matchesData = resM.ok ? await resM.json() : { matches: [] };
        const seasonsData = resS.ok ? await resS.json() : { seasons: [] };
        const clubsData = resC.ok ? await resC.json() : { clubs: [] };
        return { matchesData, seasonsData, clubsData };
      })
      .then(({ matchesData, seasonsData, clubsData }) => {
        if (active) {
          const mList: MatchItem[] = matchesData.matches || [];
          setMatches(mList);
          const seasonList: SeasonSimple[] = seasonsData.seasons || [];
          setSeasons(seasonList);
          const clubList: ClubSimple[] = clubsData.clubs || [];
          setClubs(clubList);

          if (mList.length > 0) {
            setActiveControlMatchId(mList[0].id);
          }
          if (seasonList.length > 0) {
            setSeasonId((prev) => prev || seasonList[0].id);
          }
          if (clubList.length > 1) {
            setHomeClubId((prev) => prev || clubList[0].id);
            setAwayClubId((prev) => prev || clubList[1].id);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreateSeasonInline(e: React.FormEvent) {
    e.preventDefault();
    const yearNum = parseInt(newSeasonYear, 10);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      alert(t("invalidYear"));
      return;
    }

    setCreatingSeason(true);
    try {
      const res = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: yearNum }),
      });

      if (res.ok) {
        const data = await res.json();
        const createdSeason = data.season;
        setShowNewSeasonForm(false);
        setNewSeasonYear(new Date().getFullYear().toString());

        const resS = await fetch("/api/admin/seasons");
        if (resS.ok) {
          const sData = await resS.json();
          const refreshedSeasons: SeasonSimple[] = sData.seasons || [];
          setSeasons(refreshedSeasons);
          if (createdSeason?.id) {
            setSeasonId(createdSeason.id);
          }
        }
      } else {
        alert(t("createError"));
      }
    } catch (err) {
      console.error(err);
      alert(t("createError"));
    } finally {
      setCreatingSeason(false);
    }
  }

  async function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonId || !homeClubId || !awayClubId || !scheduledAt) return;
    if (homeClubId === awayClubId) {
      alert(t("sameClubError"));
      return;
    }

    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season_id: seasonId,
          home_club_id: homeClubId,
          away_club_id: awayClubId,
          scheduled_at: new Date(scheduledAt).toISOString(),
          venue: venue.trim() || undefined,
          status: "scheduled",
        }),
      });

      if (res.ok) {
        setVenue("");
        setScheduledAt("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteMatch(id: number) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/admin/matches/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activeControlMatchId === id) {
          setActiveControlMatchId(null);
        }
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateMatchData(id: number, payload: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedMatch: MatchItem = data.match;
        setMatches((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...updatedMatch } : m))
        );
      } else {
        alert(t("updateError"));
      }
    } catch (err) {
      console.error(err);
      alert(t("updateError"));
    }
  }

  const activeMatch = matches.find((m) => m.id === activeControlMatchId);

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>{t("title")}</h1>
        <button
          type="button"
          onClick={() => setShowNewSeasonForm(!showNewSeasonForm)}
          className={styles.btnSecondary}
        >
          {showNewSeasonForm ? t("cancelNewSeason") : t("createSeason")}
        </button>
      </div>

      {showNewSeasonForm && (
        <form
          onSubmit={handleCreateSeasonInline}
          className={styles.filterBar}
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            background: "#0f172a",
            borderRadius: "8px",
            border: "1px solid #334155",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9rem" }}>
            {t("addNewSeason")}
          </span>
          <input
            type="number"
            placeholder={t("yearPlaceholder")}
            value={newSeasonYear}
            onChange={(e) => setNewSeasonYear(e.target.value)}
            required
            style={{ width: "160px" }}
          />
          <button type="submit" className={styles.btnSuccess} disabled={creatingSeason}>
            {creatingSeason ? t("saving") : t("saveSeason")}
          </button>
        </form>
      )}

      {/* MATCH CREATION FORM */}
      <form
        onSubmit={handleCreateMatch}
        className={styles.filterBar}
        style={{ marginBottom: "2rem", flexDirection: "column", alignItems: "flex-start" }}
      >
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <select value={seasonId} onChange={(e) => setSeasonId(Number(e.target.value))} required>
            <option value="" disabled>{t("selectSeason")}</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {t("seasonLabel", { year: s.year })}
              </option>
            ))}
          </select>

          <select value={homeClubId} onChange={(e) => setHomeClubId(Number(e.target.value))} required>
            <option value="" disabled>{t("homeClub")}</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select value={awayClubId} onChange={(e) => setAwayClubId(Number(e.target.value))} required>
            <option value="" disabled>{t("awayClub")}</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder={t("venueLocation")}
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />

          <button type="submit" className={styles.btnSuccess}>
            {t("createMatch")}
          </button>
        </div>
      </form>

      {/* ACTIVE SCOREBOARD CONTROL PANEL */}
      {activeMatch && (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              borderBottom: "1px solid #1e293b",
              paddingBottom: "0.75rem",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>
              {t("controlPanelTitle", { id: activeMatch.id })}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span
                className={`${styles.badge} ${
                  activeMatch.status === "live"
                    ? styles.approved
                    : activeMatch.status === "finished"
                    ? styles.pending
                    : ""
                }`}
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                }}
              >
                {t("statusLabel", { status: activeMatch.status.toUpperCase() })}
              </span>
              {activeMatch.status !== "live" ? (
                <button
                  type="button"
                  onClick={() => updateMatchData(activeMatch.id, { status: "live" })}
                  className={styles.btnSuccess}
                  style={{ fontWeight: 700, padding: "0.5rem 1rem" }}
                >
                  {t("startMatch")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateMatchData(activeMatch.id, { status: "finished" })}
                  className={styles.btnDanger}
                  style={{ fontWeight: 700, padding: "0.5rem 1rem" }}
                >
                  {t("endMatch")}
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* HOME TEAM CONTROL */}
            <div
              style={{
                background: "#1e293b",
                padding: "1rem",
                borderRadius: "6px",
                border: "1px solid #334155",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "0.75rem", color: "#f9a01b" }}>
                {t("homeTeam")}
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <select
                  value={activeMatch.home_club_id}
                  onChange={(e) =>
                    updateMatchData(activeMatch.id, { home_club_id: Number(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "#0f172a",
                    color: "#fff",
                    border: "1px solid #475569",
                    borderRadius: "4px",
                  }}
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* HOME SCORE */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                  {t("score")}
                </label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                  <input
                    type="number"
                    value={activeMatch.home_score ?? 0}
                    onChange={(e) =>
                      updateMatchData(activeMatch.id, {
                        home_score: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    style={{
                      width: "70px",
                      padding: "0.4rem",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #475569",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        home_score: Math.max(0, (activeMatch.home_score ?? 0) - 1),
                      })
                    }
                    className={styles.btnSecondary}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        home_score: (activeMatch.home_score ?? 0) + 1,
                      })
                    }
                    className={styles.btnPrimary}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        home_score: (activeMatch.home_score ?? 0) + 2,
                      })
                    }
                    className={styles.btnPrimary}
                  >
                    +2
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        home_score: (activeMatch.home_score ?? 0) + 3,
                      })
                    }
                    className={styles.btnPrimary}
                  >
                    +3
                  </button>
                </div>
              </div>

              {/* HOME FOULS */}
              <div>
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                  {t("fouls")}
                </label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        home_fouls: Math.max(0, (activeMatch.home_fouls ?? 0) - 1),
                      })
                    }
                    className={styles.btnSecondary}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={activeMatch.home_fouls ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const clamped = Math.max(0, Math.min(5, isNaN(val) ? 0 : val));
                      updateMatchData(activeMatch.id, { home_fouls: clamped });
                    }}
                    style={{
                      width: "60px",
                      padding: "0.4rem",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #475569",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        home_fouls: Math.min(5, (activeMatch.home_fouls ?? 0) + 1),
                      })
                    }
                    className={styles.btnSecondary}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* AWAY TEAM CONTROL */}
            <div
              style={{
                background: "#1e293b",
                padding: "1rem",
                borderRadius: "6px",
                border: "1px solid #334155",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "0.75rem", color: "#f9a01b" }}>
                {t("awayTeam")}
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <select
                  value={activeMatch.away_club_id}
                  onChange={(e) =>
                    updateMatchData(activeMatch.id, { away_club_id: Number(e.target.value) })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "#0f172a",
                    color: "#fff",
                    border: "1px solid #475569",
                    borderRadius: "4px",
                  }}
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* AWAY SCORE */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                  {t("score")}
                </label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                  <input
                    type="number"
                    value={activeMatch.away_score ?? 0}
                    onChange={(e) =>
                      updateMatchData(activeMatch.id, {
                        away_score: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    style={{
                      width: "70px",
                      padding: "0.4rem",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #475569",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        away_score: Math.max(0, (activeMatch.away_score ?? 0) - 1),
                      })
                    }
                    className={styles.btnSecondary}
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        away_score: (activeMatch.away_score ?? 0) + 1,
                      })
                    }
                    className={styles.btnPrimary}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        away_score: (activeMatch.away_score ?? 0) + 2,
                      })
                    }
                    className={styles.btnPrimary}
                  >
                    +2
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        away_score: (activeMatch.away_score ?? 0) + 3,
                      })
                    }
                    className={styles.btnPrimary}
                  >
                    +3
                  </button>
                </div>
              </div>

              {/* AWAY FOULS */}
              <div>
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                  {t("fouls")}
                </label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        away_fouls: Math.max(0, (activeMatch.away_fouls ?? 0) - 1),
                      })
                    }
                    className={styles.btnSecondary}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={activeMatch.away_fouls ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const clamped = Math.max(0, Math.min(5, isNaN(val) ? 0 : val));
                      updateMatchData(activeMatch.id, { away_fouls: clamped });
                    }}
                    style={{
                      width: "60px",
                      padding: "0.4rem",
                      background: "#0f172a",
                      color: "#fff",
                      border: "1px solid #475569",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateMatchData(activeMatch.id, {
                        away_fouls: Math.min(5, (activeMatch.away_fouls ?? 0) + 1),
                      })
                    }
                    className={styles.btnSecondary}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TIMER & PERIOD CONTROLS */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "center",
              flexWrap: "wrap",
              background: "#1e293b",
              padding: "1rem",
              borderRadius: "6px",
              border: "1px solid #334155",
            }}
          >
            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                {t("period")}
              </label>
              <input
                type="text"
                placeholder={t("periodPlaceholder")}
                value={activeMatch.period ?? ""}
                onChange={(e) =>
                  updateMatchData(activeMatch.id, { period: e.target.value })
                }
                style={{
                  padding: "0.4rem 0.6rem",
                  background: "#0f172a",
                  color: "#fff",
                  border: "1px solid #475569",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                {t("timer")}
              </label>
              <input
                type="text"
                placeholder={t("timerPlaceholder")}
                value={activeMatch.timer ?? ""}
                onChange={(e) =>
                  updateMatchData(activeMatch.id, { timer: e.target.value })
                }
                style={{
                  padding: "0.4rem 0.6rem",
                  background: "#0f172a",
                  color: "#fff",
                  border: "1px solid #475569",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>
                {t("tableHeaders.status")}
              </label>
              <select
                value={activeMatch.status}
                onChange={(e) =>
                  updateMatchData(activeMatch.id, { status: e.target.value })
                }
                style={{
                  padding: "0.4rem 0.6rem",
                  background: "#0f172a",
                  color: "#fff",
                  border: "1px solid #475569",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                }}
              >
                <option value="scheduled">{t("statusScheduled")}</option>
                <option value="live">{t("statusLive")}</option>
                <option value="finished">{t("statusFinished")}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* MATCHES TABLE */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : matches.length === 0 ? (
          <div className={styles.emptyState}>{t("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("tableHeaders.id")}</th>
                <th>{t("tableHeaders.homeClub")}</th>
                <th>VS</th>
                <th>{t("tableHeaders.awayClub")}</th>
                <th>{t("tableHeaders.score")}</th>
                <th>{t("tableHeaders.status")}</th>
                <th>{t("tableHeaders.scheduledAt")}</th>
                <th>{t("tableHeaders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr
                  key={m.id}
                  style={
                    m.id === activeControlMatchId
                      ? { background: "rgba(249, 160, 27, 0.08)" }
                      : {}
                  }
                >
                  <td>{m.id}</td>
                  <td>
                    <strong>{m.home_club_name}</strong>
                  </td>
                  <td>vs</td>
                  <td>
                    <strong>{m.away_club_name}</strong>
                  </td>
                  <td>
                    {m.home_score ?? 0} - {m.away_score ?? 0}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        m.status === "live"
                          ? styles.approved
                          : m.status === "finished"
                          ? styles.pending
                          : ""
                      }`}
                    >
                      {m.status === "scheduled"
                        ? t("statusScheduled")
                        : m.status === "live"
                        ? t("statusLive")
                        : m.status === "finished"
                        ? t("statusFinished")
                        : m.status}
                    </span>
                  </td>
                  <td>{new Date(m.scheduled_at).toLocaleString()}</td>
                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      onClick={() => setActiveControlMatchId(m.id)}
                      className={
                        m.id === activeControlMatchId ? styles.btnPrimary : styles.btnSecondary
                      }
                    >
                      {m.id === activeControlMatchId ? t("controlling") : t("control")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMatch(m.id)}
                      className={styles.btnDanger}
                    >
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
