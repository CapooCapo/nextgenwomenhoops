"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./editClub.module.scss";

interface ClubData {
  id: number;
  name: string;
  province_region: string;
  representative_name: string;
  founding_year: number | null;
  logo: string | null;
  capability_profile: string | null;
  u20_athlete_list: string | null;
}

export function EditClubForm({ club }: { club: ClubData }) {
  const router = useRouter();
  const [name, setName] = useState(club.name);
  const [provinceRegion, setProvinceRegion] = useState(club.province_region);
  const [representativeName, setRepresentativeName] = useState(
    club.representative_name
  );
  const [foundingYear, setFoundingYear] = useState<string>(
    club.founding_year ? String(club.founding_year) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);

      const res = await fetch(`/api/clubs/${club.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || "Cập nhật câu lạc bộ thất bại.");
      } else {
        setSuccessMsg("Cập nhật thông tin câu lạc bộ thành công!");
        router.refresh();
      }
    } catch {
      setErrorMsg("Có lỗi xảy ra trong quá trình cập nhật.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
      {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Tên câu lạc bộ <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="province_region" className={styles.label}>
            Tỉnh / Thành phố / Khu vực <span className={styles.required}>*</span>
          </label>
          <input
            id="province_region"
            name="province_region"
            type="text"
            value={provinceRegion}
            onChange={(e) => setProvinceRegion(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="representative_name" className={styles.label}>
            Người đại diện <span className={styles.required}>*</span>
          </label>
          <input
            id="representative_name"
            name="representative_name"
            type="text"
            value={representativeName}
            onChange={(e) => setRepresentativeName(e.target.value)}
            required
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="founding_year" className={styles.label}>
          Năm thành lập
        </label>
        <input
          id="founding_year"
          name="founding_year"
          type="number"
          min="1900"
          max="2030"
          value={foundingYear}
          onChange={(e) => setFoundingYear(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.fileSection}>
        <h3 className={styles.sectionTitle}>Cập nhật Hồ sơ & Tài liệu (tùy chọn)</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="logo" className={styles.label}>
            Logo câu lạc bộ (Tải lên file mới để thay thế)
          </label>
          {club.logo && (
            <p className={styles.currentFile}>File hiện tại: <a href={club.logo} target="_blank" rel="noreferrer">Xem logo</a></p>
          )}
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            className={styles.fileInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="capability_profile" className={styles.label}>
            Hồ sơ năng lực CLB (PDF / DOCX)
          </label>
          {club.capability_profile && (
            <p className={styles.currentFile}>File hiện tại: <a href={club.capability_profile} target="_blank" rel="noreferrer">Xem hồ sơ</a></p>
          )}
          <input
            id="capability_profile"
            name="capability_profile"
            type="file"
            accept=".pdf,.doc,.docx"
            className={styles.fileInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="u20_athlete_list" className={styles.label}>
            Danh sách VĐV U20 (XLSX / PDF / DOCX)
          </label>
          {club.u20_athlete_list && (
            <p className={styles.currentFile}>File hiện tại: <a href={club.u20_athlete_list} target="_blank" rel="noreferrer">Xem danh sách</a></p>
          )}
          <input
            id="u20_athlete_list"
            name="u20_athlete_list"
            type="file"
            accept=".pdf,.doc,.docx,.xlsx,.xls"
            className={styles.fileInput}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.cancelBtn}
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
