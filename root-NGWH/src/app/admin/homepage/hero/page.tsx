"use client";

import React from "react";
import Link from "next/link";
import styles from "../../adminTables.module.scss";

export default function AdminHeroPage() {
  return (
    <div style={{ paddingBottom: "3rem" }}>
      <div className={styles.pageHeader}>
        <h1>Hero Section</h1>
      </div>

      <div
        style={{
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "10px",
          padding: "2rem",
          maxWidth: "700px",
          marginTop: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.75rem" }}>📌</span>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#f8fafc" }}>
            Hero Section
          </h2>
        </div>

        <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "0.95rem" }}>
          Hero content is managed as static source-controlled assets. Changes require updating the Hero configuration and deploying the application.
        </p>

        <div
          style={{
            background: "#1e293b",
            borderRadius: "6px",
            padding: "1rem",
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: "#cbd5e1",
          }}
        >
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: "600", color: "#60a5fa" }}>
            📁 Source Location:
          </p>
          <code style={{ background: "#0f172a", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
            src/config/heroSlides.ts &amp; public/assets/hero/
          </code>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Link
            href="/admin"
            className={styles.btnSuccess}
            style={{
              display: "inline-block",
              padding: "0.6rem 1.25rem",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
