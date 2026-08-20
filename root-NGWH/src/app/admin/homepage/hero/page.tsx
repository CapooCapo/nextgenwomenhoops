"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const commonT = useTranslations("admin.common");

  const [slides, setSlides] = useState<HeroSlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mode state for Media: "file" | "url"
  const [mediaMode, setMediaMode] = useState<"file" | "url">("file");
  const [posterMode, setPosterMode] = useState<"file" | "url">("file");

  // Form State for Creation
  const [slideId, setSlideId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [posterSrc, setPosterSrc] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Explore Tournaments");
  const [ctaLink, setCtaLink] = useState("/tournaments");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [isEnabled, setIsEnabled] = useState(true);

  // File Upload State for Creation
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  // Modal State for Editing
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVideoSrc, setEditVideoSrc] = useState("");
  const [editPosterSrc, setEditPosterSrc] = useState("");
  const [editCtaLabel, setEditCtaLabel] = useState("");
  const [editCtaLink, setEditCtaLink] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState(0);
  const [editIsEnabled, setEditIsEnabled] = useState(true);

  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editPosterFile, setEditPosterFile] = useState<File | null>(null);
  const [editVideoPreview, setEditVideoPreview] = useState<string | null>(null);
  const [editPosterPreview, setEditPosterPreview] = useState<string | null>(null);

  async function fetchSlides() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero");
      if (res.ok) {
        const data = await res.json();
        const fetched: HeroSlideItem[] = data.slides || [];
        setSlides(fetched);
        if (fetched.length > 0) {
          const maxOrder = Math.max(...fetched.map((s) => s.display_order || 0));
          setDisplayOrder(String(maxOrder + 1));
        } else {
          setDisplayOrder("1");
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
    fetch("/api/admin/hero")
      .then((res) => (res.ok ? res.json() : { slides: [] }))
      .then((data) => {
        if (active) {
          const fetched: HeroSlideItem[] = data.slides || [];
          setSlides(fetched);
          if (fetched.length > 0) {
            const maxOrder = Math.max(...fetched.map((s) => s.display_order || 0));
            setDisplayOrder(String(maxOrder + 1));
          } else {
            setDisplayOrder("1");
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

  async function handleMoveSlide(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const itemCurrent = newSlides[index];
    const itemTarget = newSlides[targetIndex];

    newSlides[index] = itemTarget;
    newSlides[targetIndex] = itemCurrent;
    setSlides(newSlides);

    try {
      const orders = newSlides.map((s, idx) => ({
        id: s.id,
        display_order: idx + 1,
      }));

      const res = await fetch("/api/admin/hero/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });

      if (res.ok) {
        setSuccessMsg("Thay đổi thứ tự slide thành công!");
        fetchSlides();
      } else {
        setErrorMsg("Không thể cập nhật thứ tự.");
        fetchSlides();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Lỗi kết nối khi cập nhật thứ tự.");
      fetchSlides();
    }
  }

  // Handle Video File Selection
  function handleVideoFileChange(e: React.ChangeEvent<HTMLInputElement>, isEdit = false) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.type.startsWith("image/") && file.size > 10 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh nền không được vượt quá 10MB.");
      return;
    }
    if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) {
      setErrorMsg("Kích thước video nền không được vượt quá 50MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditVideoFile(file);
      setEditVideoPreview(previewUrl);
    } else {
      setVideoFile(file);
      setVideoPreview(previewUrl);
    }
    setErrorMsg(null);
  }

  // Handle Poster File Selection
  function handlePosterFileChange(e: React.ChangeEvent<HTMLInputElement>, isEdit = false) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh poster không được vượt quá 10MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditPosterFile(file);
      setEditPosterPreview(previewUrl);
    } else {
      setPosterFile(file);
      setPosterPreview(previewUrl);
    }
    setErrorMsg(null);
  }

  async function handleCreateSlide(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!slideId.trim()) {
      setErrorMsg("Vui lòng nhập Slide ID.");
      return;
    }

    if (mediaMode === "file" && !videoFile) {
      setErrorMsg("Vui lòng chọn file Video hoặc Ảnh nền để tải lên.");
      return;
    }
    if (mediaMode === "url" && !videoSrc.trim()) {
      setErrorMsg("Vui lòng nhập URL Video hoặc Ảnh nền.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("slide_id", slideId.trim());
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("cta_label", ctaLabel.trim());
      formData.append("cta_link", ctaLink.trim());
      formData.append("display_order", displayOrder);
      formData.append("is_enabled", isEnabled ? "true" : "false");

      if (mediaMode === "file" && videoFile) {
        formData.append("video_file", videoFile);
      } else {
        formData.append("video_src", videoSrc.trim());
      }

      if (posterMode === "file" && posterFile) {
        formData.append("poster_file", posterFile);
      } else if (posterSrc.trim()) {
        formData.append("poster_src", posterSrc.trim());
      }

      const res = await fetch("/api/admin/hero", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Thêm Hero slide thất bại.");
      } else {
        setSuccessMsg("Thêm Hero slide mới thành công!");
        // Reset form
        setSlideId("");
        setTitle("");
        setDescription("");
        setVideoSrc("");
        setPosterSrc("");
        setVideoFile(null);
        setPosterFile(null);
        setVideoPreview(null);
        setPosterPreview(null);
        if (videoFileInputRef.current) videoFileInputRef.current.value = "";
        if (posterFileInputRef.current) posterFileInputRef.current.value = "";
        fetchSlides();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Có lỗi xảy ra trong quá trình gửi dữ liệu.");
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(slide: HeroSlideItem) {
    setEditingSlide(slide);
    setEditTitle(slide.title || "");
    setEditDescription(slide.description || "");
    setEditVideoSrc(slide.video_src || "");
    setEditPosterSrc(slide.poster_src || "");
    setEditCtaLabel(slide.cta_label || "Explore Tournaments");
    setEditCtaLink(slide.cta_link || "/tournaments");
    setEditDisplayOrder(slide.display_order || 1);
    setEditIsEnabled(slide.is_enabled);
    setEditVideoFile(null);
    setEditPosterFile(null);
    setEditVideoPreview(null);
    setEditPosterPreview(null);
  }

  async function handleUpdateSlide(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSlide) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("description", editDescription.trim());
      formData.append("video_src", editVideoSrc.trim());
      formData.append("poster_src", editPosterSrc.trim());
      formData.append("cta_label", editCtaLabel.trim());
      formData.append("cta_link", editCtaLink.trim());
      formData.append("display_order", String(editDisplayOrder));
      formData.append("is_enabled", editIsEnabled ? "true" : "false");

      if (editVideoFile) {
        formData.append("video_file", editVideoFile);
      }
      if (editPosterFile) {
        formData.append("poster_file", editPosterFile);
      }

      const res = await fetch(`/api/admin/hero/${editingSlide.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Cập nhật Hero slide thất bại.");
      } else {
        setSuccessMsg("Cập nhật Hero slide thành công!");
        setEditingSlide(null);
        fetchSlides();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Có lỗi xảy ra khi cập nhật Hero slide.");
    } finally {
      setSubmitting(false);
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
    if (!confirm(t("deleteConfirm"))) return;
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
    <div style={{ paddingBottom: "3rem" }}>
      <div className={styles.pageHeader}>
        <h1>{t("title")}</h1>
      </div>

      {errorMsg && (
        <div
          style={{
            background: "#7f1d1d",
            color: "#fecaca",
            border: "1px solid #dc2626",
            padding: "0.85rem 1.25rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            background: "#14532d",
            color: "#bbf7d0",
            border: "1px solid #16a34a",
            padding: "0.85rem 1.25rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          ✅ {successMsg}
        </div>
      )}

      {/* CREATE HERO SLIDE CARD */}
      <div className={styles.createCard}>
        <h3 style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ➕ {t("addSlide")}
        </h3>

        <form onSubmit={handleCreateSlide} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Row 1: Slide ID & Order */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div className={styles.formGroup} style={{ flex: "2" }}>
              <label>Slide ID (Duy nhất) <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                type="text"
                placeholder="VD: nba-lakers-girls"
                value={slideId}
                onChange={(e) => setSlideId(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup} style={{ flex: "1" }}>
              <label>Thứ tự hiển thị</label>
              <input
                type="number"
                placeholder="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Title & Description */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div className={styles.formGroup} style={{ flex: "1" }}>
              <label>Tiêu đề Slide</label>
              <input
                type="text"
                placeholder="Tiêu đề hiển thị trên Slide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: "1" }}>
              <label>Mô tả Slide</label>
              <input
                type="text"
                placeholder="Mô tả ngắn gọn"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Video / Background Media Upload / URL */}
          <div style={{ background: "#0f172a", padding: "1.25rem", borderRadius: "8px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <label style={{ fontWeight: "700", color: "#f8fafc" }}>
                🎥 Video / Ảnh nền Hero Slide <span style={{ color: "#ef4444" }}>*</span>
              </label>

              {/* Mode Toggle */}
              <div style={{ display: "flex", background: "#1e293b", borderRadius: "6px", padding: "2px" }}>
                <button
                  type="button"
                  onClick={() => setMediaMode("file")}
                  style={{
                    padding: "0.35rem 0.75rem",
                    border: "none",
                    borderRadius: "4px",
                    background: mediaMode === "file" ? "#3b82f6" : "transparent",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                  }}
                >
                  📁 Tải file trực tiếp
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode("url")}
                  style={{
                    padding: "0.35rem 0.75rem",
                    border: "none",
                    borderRadius: "4px",
                    background: mediaMode === "url" ? "#3b82f6" : "transparent",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                  }}
                >
                  🔗 Nhập URL / Embed
                </button>
              </div>
            </div>

            {mediaMode === "file" ? (
              <div>
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleVideoFileChange(e, false)}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "#1e293b",
                    border: "1px dashed #475569",
                    borderRadius: "6px",
                    color: "#94a3b8",
                  }}
                />
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.4rem", marginBottom: "0" }}>
                  Hỗ trợ: MP4, WebM (tối đa 50MB) hoặc JPG, PNG, WebP (tối đa 10MB)
                </p>

                {videoFile && (
                  <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem", background: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                    <div style={{ flex: "1" }}>
                      <p style={{ margin: "0", fontWeight: "600", color: "#f1f5f9", fontSize: "0.85rem" }}>📄 {videoFile.name}</p>
                      <p style={{ margin: "0", color: "#94a3b8", fontSize: "0.75rem" }}>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    {videoPreview && videoFile.type.startsWith("video/") && (
                      <video src={videoPreview} controls style={{ width: "120px", maxHeight: "70px", borderRadius: "4px" }} />
                    )}
                    {videoPreview && videoFile.type.startsWith("image/") && (
                      <img src={videoPreview} alt="Preview" style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                        if (videoFileInputRef.current) videoFileInputRef.current.value = "";
                      }}
                      style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "0.35rem 0.6rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Nhập URL video (.mp4) hoặc URL nhúng YouTube/Vimeo/NBA"
                value={videoSrc}
                onChange={(e) => setVideoSrc(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#ffffff",
                }}
              />
            )}
          </div>

          {/* Row 4: Poster Upload / URL */}
          <div style={{ background: "#0f172a", padding: "1.25rem", borderRadius: "8px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <label style={{ fontWeight: "700", color: "#f8fafc" }}>
                🖼️ Ảnh Poster đại diện (Tùy chọn)
              </label>

              <div style={{ display: "flex", background: "#1e293b", borderRadius: "6px", padding: "2px" }}>
                <button
                  type="button"
                  onClick={() => setPosterMode("file")}
                  style={{
                    padding: "0.35rem 0.75rem",
                    border: "none",
                    borderRadius: "4px",
                    background: posterMode === "file" ? "#3b82f6" : "transparent",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                  }}
                >
                  📁 Tải poster file
                </button>
                <button
                  type="button"
                  onClick={() => setPosterMode("url")}
                  style={{
                    padding: "0.35rem 0.75rem",
                    border: "none",
                    borderRadius: "4px",
                    background: posterMode === "url" ? "#3b82f6" : "transparent",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                  }}
                >
                  🔗 Nhập Poster URL
                </button>
              </div>
            </div>

            {posterMode === "file" ? (
              <div>
                <input
                  ref={posterFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handlePosterFileChange(e, false)}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    background: "#1e293b",
                    border: "1px dashed #475569",
                    borderRadius: "6px",
                    color: "#94a3b8",
                  }}
                />
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.4rem", marginBottom: "0" }}>
                  Hỗ trợ: JPG, PNG, WebP (tối đa 10MB)
                </p>

                {posterFile && (
                  <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "1rem", background: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
                    <div style={{ flex: "1" }}>
                      <p style={{ margin: "0", fontWeight: "600", color: "#f1f5f9", fontSize: "0.85rem" }}>🖼️ {posterFile.name}</p>
                      <p style={{ margin: "0", color: "#94a3b8", fontSize: "0.75rem" }}>{(posterFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    {posterPreview && (
                      <img src={posterPreview} alt="Poster preview" style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview(null);
                        if (posterFileInputRef.current) posterFileInputRef.current.value = "";
                      }}
                      style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "0.35rem 0.6rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Nhập URL hình ảnh poster"
                value={posterSrc}
                onChange={(e) => setPosterSrc(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#ffffff",
                }}
              />
            )}
          </div>

          {/* Row 5: CTA Buttons & Status */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div className={styles.formGroup} style={{ flex: "1" }}>
              <label>Nhãn nút CTA</label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: "1" }}>
              <label>Đường dẫn CTA</label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
              <input
                type="checkbox"
                id="isEnabled"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <label htmlFor="isEnabled" style={{ color: "#ffffff", fontWeight: "600", cursor: "pointer" }}>
                Bật slide này
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className={styles.btnSuccess}
              style={{ padding: "0.75rem 1.75rem", fontSize: "0.95rem", fontWeight: "700" }}
            >
              {submitting ? "⏳ Đang tạo slide..." : "✨ " + t("addSlide")}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE LIST OF SLIDES */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : slides.length === 0 ? (
          <div className={styles.emptyState}>{t("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("tableHeaders.order")}</th>
                <th>{t("tableHeaders.slideId")}</th>
                <th>Media Background</th>
                <th>Poster</th>
                <th>{t("tableHeaders.ctaDestination")}</th>
                <th>{t("tableHeaders.status")}</th>
                <th>{t("tableHeaders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((s, idx) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, "up")}
                          disabled={idx === 0}
                          style={{
                            background: "#334155",
                            color: "#f8fafc",
                            border: "none",
                            padding: "0.1rem 0.3rem",
                            borderRadius: "3px",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            opacity: idx === 0 ? 0.3 : 1,
                            fontSize: "0.65rem",
                            lineHeight: 1,
                          }}
                          title="Di chuyển lên"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, "down")}
                          disabled={idx === slides.length - 1}
                          style={{
                            background: "#334155",
                            color: "#f8fafc",
                            border: "none",
                            padding: "0.1rem 0.3rem",
                            borderRadius: "3px",
                            cursor: idx === slides.length - 1 ? "not-allowed" : "pointer",
                            opacity: idx === slides.length - 1 ? 0.3 : 1,
                            fontSize: "0.65rem",
                            lineHeight: 1,
                          }}
                          title="Di chuyển xuống"
                        >
                          ▼
                        </button>
                      </div>
                      <strong>#{s.display_order}</strong>
                    </div>
                  </td>
                  <td>
                    <strong>{s.slide_id}</strong>
                    {s.title && <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{s.title}</div>}
                  </td>
                  <td style={{ maxWidth: "220px", wordBreak: "break-all" }}>
                    {s.video_src.startsWith("/media/") ? (
                      <span style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60a5fa", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", display: "inline-block", marginBottom: "0.25rem" }}>
                        📁 File Uploaded
                      </span>
                    ) : (
                      <span style={{ background: "rgba(168, 85, 247, 0.2)", color: "#c084fc", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", display: "inline-block", marginBottom: "0.25rem" }}>
                        🔗 External Link
                      </span>
                    )}
                    <div style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>{s.video_src}</div>
                  </td>
                  <td style={{ maxWidth: "160px" }}>
                    {s.poster_src ? (
                      <img
                        src={s.poster_src}
                        alt="Poster"
                        style={{ width: "80px", height: "45px", objectFit: "cover", borderRadius: "4px", border: "1px solid #334155" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Mặc định</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{s.cta_label || "Explore"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{s.cta_link}</div>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${s.is_enabled ? styles.approved : styles.pending}`}>
                      {s.is_enabled ? commonT("active") : commonT("disabled")}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className={styles.btnPrimary}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSlideEnabled(s.id, s.is_enabled)}
                        className={s.is_enabled ? styles.btnSecondary : styles.btnSuccess}
                      >
                        {s.is_enabled ? commonT("disable") : commonT("enable")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(s.id)}
                        className={styles.btnDanger}
                      >
                        {commonT("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT SLIDE MODAL */}
      {editingSlide && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "1.75rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ color: "#ffffff", marginTop: 0, marginBottom: "1.25rem", fontSize: "1.3rem" }}>
              ✏️ Chỉnh sửa Slide: <span style={{ color: "#f59e0b" }}>{editingSlide.slide_id}</span>
            </h2>

            <form onSubmit={handleUpdateSlide} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className={styles.formGroup}>
                <label>Tiêu đề Slide</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mô tả Slide</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{
                    padding: "0.6rem",
                    borderRadius: "6px",
                    background: "#0f172a",
                    border: "1px solid #334155",
                    color: "#ffffff",
                    minHeight: "70px",
                  }}
                />
              </div>

              {/* Media URL / File Replace */}
              <div className={styles.formGroup}>
                <label>URL Video / Media hiện tại</label>
                <input
                  type="text"
                  value={editVideoSrc}
                  onChange={(e) => setEditVideoSrc(e.target.value)}
                />
                <label style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                  Tải file mới để thay thế Video/Ảnh nền hiện tại (tùy chọn):
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
                  onChange={(e) => handleVideoFileChange(e, true)}
                  style={{ background: "#0f172a", border: "1px solid #334155", padding: "0.5rem", borderRadius: "6px", color: "#cbd5e1" }}
                />
                {editVideoPreview && (
                  <p style={{ fontSize: "0.8rem", color: "#4ade80", margin: "0.25rem 0 0 0" }}>✅ Đã chọn file mới để thay thế</p>
                )}

                {/* Media Preview Player for Edit Modal */}
                {(editVideoPreview || editVideoSrc) && (
                  <div style={{ marginTop: "0.5rem" }}>
                    {(editVideoFile && editVideoFile.type.startsWith("video/")) ||
                    (!editVideoFile && (/\.(mp4|webm)($|\?)/i.test(editVideoSrc) || editVideoSrc.includes("video"))) ? (
                      <video
                        src={editVideoPreview || editVideoSrc}
                        controls
                        muted
                        style={{ width: "200px", maxHeight: "112px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a" }}
                      />
                    ) : (
                      <img
                        src={editVideoPreview || editVideoSrc}
                        alt="Preview"
                        style={{ width: "200px", height: "112px", objectFit: "cover", borderRadius: "6px", border: "1px solid #334155" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Poster URL / File Replace */}
              <div className={styles.formGroup}>
                <label>URL Poster hiện tại</label>
                <input
                  type="text"
                  value={editPosterSrc}
                  onChange={(e) => setEditPosterSrc(e.target.value)}
                />
                <label style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                  Tải file poster mới để thay thế (tùy chọn):
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handlePosterFileChange(e, true)}
                  style={{ background: "#0f172a", border: "1px solid #334155", padding: "0.5rem", borderRadius: "6px", color: "#cbd5e1" }}
                />
                {editPosterPreview && (
                  <p style={{ fontSize: "0.8rem", color: "#4ade80", margin: "0.25rem 0 0 0" }}>✅ Đã chọn poster mới để thay thế</p>
                )}
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Nhãn CTA</label>
                  <input
                    type="text"
                    value={editCtaLabel}
                    onChange={(e) => setEditCtaLabel(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Đường dẫn CTA</label>
                  <input
                    type="text"
                    value={editCtaLink}
                    onChange={(e) => setEditCtaLink(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={editDisplayOrder}
                    onChange={(e) => setEditDisplayOrder(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.25rem" }}>
                  <input
                    type="checkbox"
                    id="editIsEnabled"
                    checked={editIsEnabled}
                    onChange={(e) => setEditIsEnabled(e.target.checked)}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <label htmlFor="editIsEnabled" style={{ color: "#ffffff", cursor: "pointer" }}>
                    Kích hoạt
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className={styles.btnSecondary}
                  style={{ padding: "0.6rem 1.25rem" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.btnSuccess}
                  style={{ padding: "0.6rem 1.25rem" }}
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
