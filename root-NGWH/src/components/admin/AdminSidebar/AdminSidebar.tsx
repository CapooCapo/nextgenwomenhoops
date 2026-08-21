"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./AdminSidebar.module.scss";

export function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const roleT = useTranslations("admin.roles");
  const pathname = usePathname();
  const [role, setRole] = useState<"admin" | "subadmin" | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.role) {
          setRole(data.role);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/clubs", label: t("clubs") },
    { href: "/admin/registrations", label: t("registrations") },
    { href: "/admin/players", label: t("players") },
    { href: "/admin/matches", label: t("matches") },
    { href: "/admin/news", label: t("news") },
    { href: "/admin/gallery", label: t("gallery") },
    { href: "/admin/contact", label: t("contact") },
  ];

  if (role === "admin") {
    navItems.push({ href: "/admin/users", label: t("users") });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        NGWH Admin
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>NextGen Women Hoops</span>
          {role === "admin" && (
            <span
              style={{
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "4px",
                textTransform: "uppercase",
              }}
            >
              {roleT("admin")}
            </span>
          )}
          {role === "subadmin" && (
            <span
              style={{
                background: "#d97706",
                color: "#ffffff",
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "4px",
                textTransform: "uppercase",
              }}
            >
              {roleT("subadminReadOnly")}
            </span>
          )}
        </div>
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
