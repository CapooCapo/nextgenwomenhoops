"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./AdminHeader.module.scss";

export function AdminHeader() {
  const t = useTranslations("admin.nav");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/clubs", label: t("clubs") },
    { href: "/admin/registrations", label: t("registrations") },
    { href: "/admin/players", label: t("players") },
    { href: "/admin/matches", label: t("matches") },
    { href: "/admin/news", label: t("news") },
    { href: "/admin/gallery", label: t("gallery") },
    { href: "/admin/contact", label: t("contact") },
    { href: "/admin/homepage/hero", label: t("hero") },
  ];

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.mobileBrand}>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Admin Menu"
          >
            ☰
          </button>
          <span className={styles.title}>{t("title")}</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "6px",
              padding: "0.35rem 0.75rem",
              color: "#ef4444",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
          >
            {t("logout")}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`${styles.mobileDrawerOverlay} ${drawerOpen ? styles.open : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${drawerOpen ? styles.open : ""}`}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setDrawerOpen(false)}
          aria-label="Close Admin Menu"
        >
          ✕
        </button>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                onClick={() => setDrawerOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
