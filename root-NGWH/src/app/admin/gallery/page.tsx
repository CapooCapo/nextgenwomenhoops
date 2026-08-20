"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  media_type: string;
  media_url: string;
  caption: string | null;
}

export default function AdminGalleryPage() {
  const t = useTranslations("admin.gallery");
  const commonT = useTranslations("admin.common");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("media");
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");

  async function fetchGalleryItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/gallery")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (active) {
          setItems(data.items || []);
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

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) return;

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          media_type: mediaType,
          media_url: mediaUrl.trim(),
          caption: caption.trim() || undefined,
        }),
      });

      if (res.ok) {
        setTitle("");
        setMediaUrl("");
        setCaption("");
        fetchGalleryItems();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteItem(id: number) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGalleryItems();
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

      <form onSubmit={handleCreateItem} className={styles.filterBar} style={{ flexDirection: "column", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <input
            type="text"
            placeholder={t("itemTitlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ flex: 2 }}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1 }}>
            <option value="media">{t("categories.media")}</option>
            <option value="mvp">{t("categories.mvp")}</option>
            <option value="behindScenes">{t("categories.behindScenes")}</option>
          </select>

          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} style={{ flex: 1 }}>
            <option value="image">{t("mediaTypes.image")}</option>
            <option value="video">{t("mediaTypes.video")}</option>
          </select>
        </div>

        <input
          type="text"
          placeholder={t("mediaUrlPlaceholder")}
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          required
          style={{ width: "100%" }}
        />

        <input
          type="text"
          placeholder={t("captionPlaceholder")}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ width: "100%" }}
        />

        <button type="submit" className={styles.btnSuccess} style={{ marginTop: "0.5rem" }}>
          {t("addItem")}
        </button>
      </form>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>{t("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("tableHeaders.id")}</th>
                <th>{t("tableHeaders.title")}</th>
                <th>{t("tableHeaders.category")}</th>
                <th>{t("tableHeaders.type")}</th>
                <th>{t("tableHeaders.mediaUrl")}</th>
                <th>{t("tableHeaders.caption")}</th>
                <th>{t("tableHeaders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.media_type}</td>
                  <td style={{ wordBreak: "break-all", maxWidth: "200px" }}>{item.media_url}</td>
                  <td>{item.caption || "-"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
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
