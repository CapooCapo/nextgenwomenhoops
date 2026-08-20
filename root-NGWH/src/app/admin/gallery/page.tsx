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
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
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
            placeholder="Item Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ flex: 2 }}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1 }}>
            <option value="media">Championship Library</option>
            <option value="mvp">MVP Spotlight</option>
            <option value="behindScenes">Behind The Scenes</option>
          </select>

          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} style={{ flex: 1 }}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Media URL (e.g. /images/hero.jpg or https://...)"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
          required
          style={{ width: "100%" }}
        />

        <input
          type="text"
          placeholder="Caption (Optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          style={{ width: "100%" }}
        />

        <button type="submit" className={styles.btnSuccess} style={{ marginTop: "0.5rem" }}>
          Add Gallery Item
        </button>
      </form>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading gallery items...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>No gallery items found. Add your first photo/video above.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Media URL</th>
                <th>Caption</th>
                <th>Actions</th>
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
                      Delete
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
