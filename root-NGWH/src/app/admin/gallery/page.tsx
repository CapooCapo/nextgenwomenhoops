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

      <div className={styles.createCard}>
        <h3>{t("addGalleryItem", { fallback: "+ Thêm Thư viện" })}</h3>
        <form onSubmit={handleCreateItem} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label htmlFor="gallery-title">{t("titlePlaceholder")}</label>
            <input
              id="gallery-title"
              type="text"
              placeholder={t("titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup} style={{ flex: "0 1 200px" }}>
            <label htmlFor="gallery-category">{t("tableHeaders.category", { fallback: "Category" })}</label>
            <select id="gallery-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="media">{t("categories.media")}</option>
              <option value="mvp">{t("categories.mvp")}</option>
              <option value="behindScenes">{t("categories.behindScenes")}</option>
            </select>
          </div>

          <div className={styles.formGroup} style={{ flex: "0 1 150px" }}>
            <label htmlFor="gallery-type">{t("tableHeaders.type", { fallback: "Type" })}</label>
            <select id="gallery-type" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
              <option value="image">{t("types.image", { fallback: "Image" })}</option>
              <option value="video">{t("types.video", { fallback: "Video" })}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gallery-url">{t("mediaUrlPlaceholder")}</label>
            <input
              id="gallery-url"
              type="text"
              placeholder={t("mediaUrlPlaceholder")}
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gallery-caption">{t("captionPlaceholder")}</label>
            <input
              id="gallery-caption"
              type="text"
              placeholder={t("captionPlaceholder")}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className={styles.submitWrapper}>
            <button type="submit" className={styles.btnSuccess}>
              {t("addGalleryItem")}
            </button>
          </div>
        </form>
      </div>

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
