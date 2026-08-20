"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./login.module.scss";

export default function AdminLoginPage() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || t("error"));
      }
    } catch (err) {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.brand}>NextGen Women Hoops</div>
          <h1 className={styles.title}>{t("title")}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error} role="alert">{error}</div>}

          <div className={styles.field}>
            <label htmlFor="username">{t("username")}</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">{t("password")}</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "..." : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
