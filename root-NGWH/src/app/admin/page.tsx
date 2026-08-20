import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getAdminDashboardMetrics } from "@/server/services/adminDashboardService";
import styles from "./dashboard.module.scss";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin.dashboard");
  const navT = await getTranslations("admin.nav");
  const metrics = await getAdminDashboardMetrics();

  return (
    <div>
      <div className={styles.header}>
        <h1>{t("title")}</h1>
        <p>NextGen Women Hoops Administration & Content Control</p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.label}>{t("totalClubs")}</span>
          <span className={styles.value}>{metrics.totalClubs}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.label}>{t("pendingApprovals")}</span>
          <span className={`${styles.value} ${metrics.pendingApprovals > 0 ? styles.accent : ""}`}>
            {metrics.pendingApprovals}
          </span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.label}>{t("seasons")}</span>
          <span className={styles.value}>{metrics.totalSeasons}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.label}>{t("matches")}</span>
          <span className={styles.value}>{metrics.totalMatches}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.label}>{t("heroSlides")}</span>
          <span className={styles.value}>{metrics.heroSlides}</span>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Management Links</h2>
        <div className={styles.actionLinks}>
          <Link href="/admin/registrations">{navT("registrations")}</Link>
          <Link href="/admin/clubs">{navT("clubs")}</Link>
          <Link href="/admin/matches">{navT("matches")}</Link>
          <Link href="/admin/homepage/hero">{navT("hero")}</Link>
        </div>
      </div>
    </div>
  );
}
