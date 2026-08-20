"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function AdminContactPage() {
  const t = useTranslations("admin.contact");
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/contact")
      .then((res) => (res.ok ? res.json() : { submissions: [] }))
      .then((data) => {
        if (active) {
          setSubmissions(data.submissions || []);
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

  async function handleDeleteSubmission(id: number) {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSubmissions();
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
          <div className={styles.emptyState}>Loading contact submissions...</div>
        ) : submissions.length === 0 ? (
          <div className={styles.emptyState}>No contact submissions recorded yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Received At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.id}</td>
                  <td>
                    <strong>{sub.name}</strong>
                  </td>
                  <td>
                    <a href={`mailto:${sub.email}`} className={styles.docLink}>
                      {sub.email}
                    </a>
                  </td>
                  <td>{sub.subject || "-"}</td>
                  <td style={{ maxWidth: "300px" }}>{sub.message}</td>
                  <td>{new Date(sub.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmission(sub.id)}
                      className={styles.btnDanger}
                    >
                      Delete
                    </button>
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
