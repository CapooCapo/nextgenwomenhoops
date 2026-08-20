"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "../newsEditor.module.scss";

export default function AdminNewNewsPage() {
  const router = useRouter();
  const t = useTranslations("admin.news");
  const commonT = useTranslations("admin.common");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("tournament_news");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("invalidImageError"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("imageSizeError"));
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImageUrl("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError(t("titleRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          summary: summary.trim(),
          content: content.trim(),
          image_url: imageUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("saveError"));
      }

      router.push("/admin/news");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("saveError");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.pageHeader}>
        <h1>{t("createArticle")}</h1>
        <Link href="/admin/news" className={styles.btnCancel}>
          {t("backToNews")}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label>
              {t("articleTitle")} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder={t("articleTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>
              {t("category")} <span className={styles.required}>*</span>
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="tournament_news">{t("categories.tournament_news")}</option>
              <option value="inspirational">{t("categories.inspirational")}</option>
              <option value="knowledge_nutrition">{t("categories.knowledge_nutrition")}</option>
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>{t("summary")}</label>
          <input
            type="text"
            placeholder={t("summaryPlaceholder")}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>{t("fullContent")}</label>
          <textarea
            placeholder={t("fullContentPlaceholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>{t("articleImage")}</label>
          <div className={styles.imageUploadSection}>
            {imageUrl ? (
              <div className={styles.imagePreviewWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Article Preview" />
                <button
                  type="button"
                  className={styles.removeImgBtn}
                  onClick={handleRemoveImage}
                >
                  {t("removeImage")}
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ marginBottom: "0.5rem" }}
                />
                <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  {t("orImageUrl")}
                </div>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ marginTop: "0.25rem", width: "100%" }}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.actionsBar}>
          <Link href="/admin/news" className={styles.btnCancel}>
            {commonT("cancel")}
          </Link>
          <button type="submit" className={styles.btnSave} disabled={submitting}>
            {submitting ? t("publishing") : t("publishArticle")}
          </button>
        </div>
      </form>
    </div>
  );
}
