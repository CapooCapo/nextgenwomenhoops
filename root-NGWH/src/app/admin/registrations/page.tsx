"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminRole } from "@/hooks/useAdminRole";
import styles from "../adminTables.module.scss";

interface PendingRegistration {
  id: number;
  name: string;
  province_region: string;
  representative_name: string;
  capability_profile: string | null;
  u20_athlete_list: string | null;
}

function parseAthleteImages(raw: string | null): string[] {
  if (!raw) return [];
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) =>
          String(item).startsWith("/") ? String(item) : `/media/${item}`
        );
      }
    } catch {}
  }
  return [raw.startsWith("/") ? raw : `/media/${raw}`];
}

export default function AdminRegistrationsPage() {
  const t = useTranslations("admin.registrations");
  const roleT = useTranslations("admin.roles");
  const { isSubadmin } = useAdminRole();
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPendingRegistrations() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clubs?approved=false");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.clubs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/clubs?approved=false")
      .then((res) => (res.ok ? res.json() : { clubs: [] }))
      .then((data) => {
        if (active) {
          setRegistrations(data.clubs || []);
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

  async function handleApprove(id: number) {
    if (isSubadmin) return;
    try {
      const res = await fetch(`/api/admin/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: true }),
      });
      if (res.ok) {
        fetchPendingRegistrations();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject(id: number) {
    if (isSubadmin) return;
    if (!confirm(t("rejectConfirm"))) return;
    try {
      const res = await fetch(`/api/admin/clubs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPendingRegistrations();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>{t("title")}</h1>
        {isSubadmin && (
          <span style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: 600 }}>
            {roleT("subadminNotice")}
          </span>
        )}
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : registrations.length === 0 ? (
          <div className={styles.emptyState}>{t("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("tableHeaders.id")}</th>
                <th>{t("tableHeaders.name")}</th>
                <th>{t("tableHeaders.region")}</th>
                <th>{t("tableHeaders.representative")}</th>
                <th>{t("tableHeaders.documents")}</th>
                <th>{t("tableHeaders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((item) => {
                const u20Images = parseAthleteImages(item.u20_athlete_list);

                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.province_region}</td>
                    <td>{item.representative_name || "-"}</td>
                    <td>
                      <div style={{ marginBottom: "0.5rem" }}>
                        {item.capability_profile ? (
                          <a
                            href={
                              item.capability_profile.startsWith("/")
                                ? item.capability_profile
                                : `/media/${item.capability_profile}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.docLink}
                          >
                            {t("capabilityProfile")}
                          </a>
                        ) : (
                          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                            {t("noCapabilityProfile")}
                          </span>
                        )}
                      </div>

                      {u20Images.length > 0 ? (
                        <div>
                          <p style={{ fontSize: "0.8rem", fontWeight: 600, margin: "0 0 0.25rem 0", color: "#2563eb" }}>
                            {t("u20AthleteImages", { count: u20Images.length })}
                          </p>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {u20Images.map((src, idx) => (
                              <a key={idx} href={src} target="_blank" rel="noreferrer">
                                <img
                                  src={src}
                                  alt={`U20 ${idx + 1}`}
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                    border: "1px solid #cbd5e1",
                                  }}
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
                          {t("noU20Images")}
                        </span>
                      )}
                    </td>
                    <td>
                      {isSubadmin ? (
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{roleT("readOnlyBadge")}</span>
                      ) : (
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id)}
                            className={styles.btnSuccess}
                          >
                            {t("approve")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item.id)}
                            className={styles.btnDanger}
                          >
                            {t("reject")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
