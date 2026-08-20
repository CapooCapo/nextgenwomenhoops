"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface PlayerItem {
  id: number;
  name: string;
  club_id: number;
  club_name: string;
}

interface ClubSimple {
  id: number;
  name: string;
}

export default function AdminPlayersPage() {
  const t = useTranslations("admin.players");
  const commonT = useTranslations("admin.common");
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [clubs, setClubs] = useState<ClubSimple[]>([]);
  const [loading, setLoading] = useState(true);

  // New Player Form State
  const [name, setName] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<number | "">("");

  async function fetchPlayersAndClubs() {
    setLoading(true);
    try {
      const [resP, resC] = await Promise.all([
        fetch("/api/admin/players"),
        fetch("/api/admin/clubs"),
      ]);

      if (resP.ok) {
        const data = await resP.json();
        setPlayers(data.players || []);
      }
      if (resC.ok) {
        const data = await resC.json();
        setClubs(data.clubs || []);
        if (data.clubs && data.clubs.length > 0 && !selectedClubId) {
          setSelectedClubId(data.clubs[0].id);
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
    Promise.all([fetch("/api/admin/players"), fetch("/api/admin/clubs")])
      .then(async ([resP, resC]) => {
        const playersData = resP.ok ? await resP.json() : { players: [] };
        const clubsData = resC.ok ? await resC.json() : { clubs: [] };
        return { playersData, clubsData };
      })
      .then(({ playersData, clubsData }) => {
        if (active) {
          setPlayers(playersData.players || []);
          setClubs(clubsData.clubs || []);

          if (clubsData.clubs && clubsData.clubs.length > 0) {
            setSelectedClubId((prev) => prev || clubsData.clubs[0].id);
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

  async function handleCreatePlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !selectedClubId) return;

    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ club_id: selectedClubId, name: name.trim() }),
      });

      if (res.ok) {
        setName("");
        fetchPlayersAndClubs();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePlayer(id: number) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/admin/players/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPlayersAndClubs();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>{t("title")}</h1>
      </div>

      {/* Create Player Form */}
      <form onSubmit={handleCreatePlayer} className={styles.filterBar} style={{ marginBottom: "2rem" }}>
        <select
          value={selectedClubId}
          onChange={(e) => setSelectedClubId(Number(e.target.value))}
          required
        >
          <option value="" disabled>{t("selectClub")}</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={t("playerFullName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button type="submit" className={styles.btnSuccess}>
          {t("addPlayer")}
        </button>
      </form>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : players.length === 0 ? (
          <div className={styles.emptyState}>{t("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("tableHeaders.id")}</th>
                <th>{t("tableHeaders.name")}</th>
                <th>{t("tableHeaders.club")}</th>
                <th>{t("tableHeaders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>{p.club_name}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeletePlayer(p.id)}
                      className={styles.btnDanger}
                    >
                      {commonT("delete")}
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
