"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./AdminSidebar.module.scss";

export function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        NGWH Admin
        <span>NextGen Women Hoops</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
