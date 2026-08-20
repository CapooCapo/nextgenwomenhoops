"use client";

import React, { useState, useEffect } from "react";

export interface OBSMatch {
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

export default function OBSScoreboardPage() {
  const [match, setMatch] = useState<OBSMatch | null>(null);

  useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        eventSource = new EventSource("/api/matches/live-stream");

        eventSource.addEventListener("match_update", (event: MessageEvent) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            setMatch(data.match);
          } catch {
            // Ignore
          }
        });
      } catch {
        // Handle error
      }
    }

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  if (!match) {
    return (
      <div style={{ padding: "20px", color: "#fff", background: "rgba(0,0,0,0.8)", fontFamily: "sans-serif" }}>
        WAITING FOR MATCH DATA...
      </div>
    );
  }

  const isLive =
    match.status?.toLowerCase() === "live" ||
    match.status?.toLowerCase() === "in_progress";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "16px 24px",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        fontFamily: "'Inter', sans-serif",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Home Team */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
        {match.home_club.logo && (
          <img
            src={match.home_club.logo}
            alt={match.home_club.name}
            style={{ width: "48px", height: "48px", objectFit: "contain" }}
          />
        )}
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.2rem", textTransform: "uppercase" }}>
            {match.home_club.name}
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, color: "#94a3b8" }}>
            FOULS: {match.home_fouls ?? 0}
          </div>
        </div>
        <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#38bdf8", marginLeft: "auto" }}>
          {match.home_score ?? 0}
        </div>
      </div>

      {/* Center Match Clock & Period */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 32px",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "1px",
            color: isLive ? "#ef4444" : "#e2e8f0",
            textTransform: "uppercase",
          }}
        >
          {isLive ? "● LIVE" : match.status}
        </div>
        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f8fafc" }}>
          {match.timer || "00:00"}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
          {match.period || "Q1"}
        </div>
      </div>

      {/* Away Team */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, flexDirection: "row-reverse" }}>
        {match.away_club.logo && (
          <img
            src={match.away_club.logo}
            alt={match.away_club.name}
            style={{ width: "48px", height: "48px", objectFit: "contain" }}
          />
        )}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: "1.2rem", textTransform: "uppercase" }}>
            {match.away_club.name}
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, color: "#94a3b8" }}>
            FOULS: {match.away_fouls ?? 0}
          </div>
        </div>
        <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#38bdf8", marginRight: "auto" }}>
          {match.away_score ?? 0}
        </div>
      </div>
    </div>
  );
}
