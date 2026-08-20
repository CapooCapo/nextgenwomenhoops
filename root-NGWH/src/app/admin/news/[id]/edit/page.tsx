"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "../../newsEditor.module.scss";

export default function AdminEditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("tournament_news");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) return;

    fetch(`/api/admin/news/${articleId}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Article not found.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.article) {
          setTitle(data.article.title || "");
          setCategory(data.article.category || "tournament_news");
          setSummary(data.article.summary || "");
          setContent(data.article.content || "");
          setImageUrl(data.article.image_url || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load article.");
        setLoading(false);
      });
  }, [articleId]);

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
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
      setError("Article title is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/news/${articleId}`, {
        method: "PATCH",
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
        throw new Error(data.error || "Failed to update article.");
      }

      router.push("/admin/news");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.editorContainer}>
        <div style={{ color: "#94a3b8", padding: "3rem", textAlign: "center" }}>
          Loading article data...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.pageHeader}>
        <h1>Edit News Article #{articleId}</h1>
        <Link href="/admin/news" className={styles.btnCancel}>
          ← Back to News
        </Link>
      </div>

      <form onSubmit={handleSubmit} className={styles.formCard}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label>
              Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="Article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>
              Category <span className={styles.required}>*</span>
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="tournament_news">Tournament News</option>
              <option value="inspirational">Inspirational Stories</option>
              <option value="knowledge_nutrition">Knowledge & Nutrition</option>
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>Summary / Excerpt</label>
          <input
            type="text"
            placeholder="Brief 1-2 sentence summary..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Full Content</label>
          <textarea
            placeholder="Write full article content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Article Image</label>
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
                  Remove Image
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
                  Or enter image URL:
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
            Cancel
          </Link>
          <button type="submit" className={styles.btnSave} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
