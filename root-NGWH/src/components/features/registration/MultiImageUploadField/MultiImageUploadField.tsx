"use client";

import React, { useState, useRef } from "react";
import styles from "./MultiImageUploadField.module.scss";

interface MultiImageUploadFieldProps {
  id: string;
  name: string;
  label: string;
  hint?: string;
  maxFiles?: number;
  error?: string;
  existingImages?: string[];
}

export function MultiImageUploadField({
  id,
  name,
  label,
  hint,
  maxFiles = 12,
  error,
  existingImages = [],
}: MultiImageUploadFieldProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncFileInputFiles = (files: File[]) => {
    if (!fileInputRef.current) return;
    try {
      const dt = new DataTransfer();
      for (const file of files) {
        dt.items.add(file);
      }
      fileInputRef.current.files = dt.files;
    } catch {
      // Fallback
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > maxFiles) {
      setLocalError(`Bạn chỉ có thể chọn tối đa ${maxFiles} hình ảnh VĐV U20.`);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setLocalError(`Tệp "${file.name}" không phải là định dạng hình ảnh hợp lệ.`);
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setLocalError(`Hình ảnh "${file.name}" vượt quá kích thước tối đa 20MB.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);
    setPreviews((prev) => [...prev, ...newPreviews]);
    syncFileInputFiles(updatedFiles);
  };

  const handleRemove = (index: number) => {
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setLocalError(null);
    syncFileInputFiles(updatedFiles);
  };

  const displayError = error || localError;

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.headerRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={styles.counter}>
          {selectedFiles.length + existingImages.length} / {maxFiles} hình ảnh
        </span>
      </div>

      {hint && <p className={styles.hint}>{hint}</p>}

      {existingImages.length > 0 && selectedFiles.length === 0 && (
        <div className={styles.existingSection}>
          <p className={styles.existingTitle}>Hình ảnh hiện tại ({existingImages.length}):</p>
          <div className={styles.previewGrid}>
            {existingImages.map((url, idx) => (
              <div key={idx} className={styles.previewCard}>
                <img src={url} alt={`U20 Athlete ${idx + 1}`} className={styles.thumb} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.uploadArea}>
        <input
          ref={fileInputRef}
          id={id}
          name={name}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={selectedFiles.length >= maxFiles}
          className={styles.hiddenInput}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={selectedFiles.length >= maxFiles}
          className={styles.uploadBtn}
        >
          📷 {selectedFiles.length >= maxFiles ? "Đã đạt tối đa 12 hình ảnh" : "Chọn / Tải lên hình ảnh VĐV U20 (Tối đa 12)"}
        </button>
      </div>

      {previews.length > 0 && (
        <div className={styles.previewGrid}>
          {previews.map((src, index) => (
            <div key={index} className={styles.previewCard}>
              <img src={src} alt={`Preview ${index + 1}`} className={styles.thumb} />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className={styles.removeBtn}
                title="Xóa hình này"
                aria-label={`Remove image ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {displayError && <div className={styles.errorMsg}>{displayError}</div>}
    </div>
  );
}
