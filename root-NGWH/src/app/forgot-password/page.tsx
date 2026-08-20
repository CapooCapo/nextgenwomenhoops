"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "../auth.module.scss";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setNotice("");
    setResetToken("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        if (data.notice) setNotice(data.notice);
        if (data.resetToken) setResetToken(data.resetToken);
      } else {
        setError(data.error || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.brand}>NextGen Women Hoops</div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error} role="alert">{error}</div>}
          {message && <div className={styles.notice}>{message}</div>}
          {notice && <div className={styles.gapAlert}>{notice}</div>}
          {resetToken && (
            <div className={styles.notice} style={{ marginTop: "0.5rem", wordBreak: "break-all" }}>
              <strong>Direct Reset Link (Dev/Demo):</strong>{" "}
              <Link href={`/reset-password?token=${resetToken}`}>
                /reset-password?token={resetToken}
              </Link>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email">{t("email")}</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "..." : t("submit")}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <div>
            <Link href="/login">{t("backToLogin")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
