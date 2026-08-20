"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface PendingRegistration {
  id: number;
  name: string;
  province_region: string;
  representative_name: string;
  capability_profile: string | null;
  u20_athlete_list: string | null;
}

export default function AdminRegistrationsPage() {
  const t = useTranslations("admin.registrations");
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
    if (!confirm("Are you sure you want to reject and delete this registration?")) return;
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
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading registrations...</div>
        ) : registrations.length === 0 ? (
          <div className={styles.emptyState}>{t("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Club Name</th>
                <th>Region</th>
                <th>Representative</th>
                <th>Uploaded Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.province_region}</td>
                  <td>{item.representative_name || "-"}</td>
                  <td>
                    <div>
                      {item.capability_profile ? (
                        <a
                          href={item.capability_profile.startsWith("/") ? item.capability_profile : `/media/${item.capability_profile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          Capability Profile
                        </a>
                      ) : (
                        <span style={{ color: "#64748b" }}>No profile document</span>
                      )}
                    </div>
                    <div>
                      {item.u20_athlete_list ? (
                        <a
                          href={item.u20_athlete_list.startsWith("/") ? item.u20_athlete_list : `/media/${item.u20_athlete_list}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.docLink}
                        >
                          U20 Athlete List
                        </a>
                      ) : (
                        <span style={{ color: "#64748b" }}>No athlete list</span>
                      )}
                    </div>
                  </td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
