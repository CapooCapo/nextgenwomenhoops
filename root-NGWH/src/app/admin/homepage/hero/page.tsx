"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../../adminTables.module.scss";

interface HeroSlideItem {
  id: number;
  slide_id: string;
  title: string;
  description: string;
  video_src: string;
  poster_src: string;
  cta_label: string;
  cta_link: string;
  display_order: number;
  is_enabled: boolean;
}

export default function AdminHeroPage() {
  const t = useTranslations("admin.hero");
  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [slideId, setSlideId] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterSrc, setPosterSrc] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Explore Tournaments");
  const [ctaLink, setCtaLink] = useState("/tournaments");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [isEnabled, setIsEnabled] = useState(true);

  async function fetchSlides() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) {
        const data = await res.json();
        setSlides(data.slides || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/hero")
      .then((res) => (res.ok ? res.json() : { slides: [] }))
      .then((data) => {
        if (active) {
          setSlides(data.slides || []);
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

  async function handleCreateSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!slideId.trim() || !videoSrc.trim()) return;

    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slide_id: slideId.trim(),
          video_src: videoSrc.trim(),
          title: title.trim(),
          description: description.trim(),
          poster_src: posterSrc.trim(),
          cta_label: ctaLabel.trim(),
          cta_link: ctaLink.trim(),
          display_order: parseInt(displayOrder, 10) || 0,
          is_enabled: isEnabled,
        }),
      });

      if (res.ok) {
        setSlideId("");
        setVideoSrc("");
        setTitle("");
        setDescription("");
        setPosterSrc("");
        fetchSlides();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleSlideEnabled(id: number, currentEnabled: boolean) {
    try {
      const res = await fetch(`/api/admin/hero/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: !currentEnabled }),
      });
      if (res.ok) {
        fetchSlides();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteSlide(id: number) {
    if (!confirm("Are you sure you want to delete this hero slide?")) return;
    try {
      const res = await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSlides();
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

      <form onSubmit={handleCreateSlide} className={styles.filterBar} style={{ flexDirection: "column", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <input
            type="text"
            placeholder="Slide Unique ID (e.g. team-huddle)"
            value={slideId}
            onChange={(e) => setSlideId(e.target.value)}
            required
            style={{ flex: 1 }}
          />

          <input
            type="text"
            placeholder="Video URL (.mp4)"
            value={videoSrc}
            onChange={(e) => setVideoSrc(e.target.value)}
            required
            style={{ flex: 2 }}
          />

          <input
            type="number"
            placeholder="Display Order"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            style={{ width: "100px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <input
            type="text"
            placeholder="Slide Title / Tagline (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ flex: 1 }}
          />

          <input
            type="text"
            placeholder="Poster Image URL (Optional)"
            value={posterSrc}
            onChange={(e) => setPosterSrc(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <input
            type="text"
            placeholder="CTA Button Label"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            style={{ flex: 1 }}
          />

          <input
            type="text"
            placeholder="CTA Destination Link (e.g. /tournaments)"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        <button type="submit" className={styles.btnSuccess} style={{ marginTop: "0.5rem" }}>
          {t("addSlide")}
        </button>
      </form>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading hero slides...</div>
        ) : slides.length === 0 ? (
          <div className={styles.emptyState}>No hero slides configured. Create one above.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Slide ID</th>
                <th>Video URL</th>
                <th>Poster URL</th>
                <th>CTA Destination</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>#{s.display_order}</strong>
                  </td>
                  <td>
                    <strong>{s.slide_id}</strong>
                  </td>
                  <td style={{ wordBreak: "break-all", maxWidth: "200px" }}>{s.video_src}</td>
                  <td style={{ wordBreak: "break-all", maxWidth: "150px" }}>{s.poster_src || "Default Hero"}</td>
                  <td>{s.cta_link}</td>
                  <td>
                    <span className={`${styles.badge} ${s.is_enabled ? styles.approved : styles.pending}`}>
                      {s.is_enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        onClick={() => toggleSlideEnabled(s.id, s.is_enabled)}
                        className={s.is_enabled ? styles.btnSecondary : styles.btnSuccess}
                      >
                        {s.is_enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(s.id)}
                        className={styles.btnDanger}
                      >
                        Delete
                      </button>
                    </div>
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
