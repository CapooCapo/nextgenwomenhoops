"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface AdminUserItem {
  id: number;
  username: string;
  role: "admin" | "subadmin";
  status: "active" | "disabled";
  created_at: Date | string;
}

export function AdminUserManagementClient({
  initialUsers,
}: {
  initialUsers: AdminUserItem[];
}) {
  const t = useTranslations("admin.users");
  const commonT = useTranslations("admin.common");
  const rolesT = useTranslations("admin.roles");

  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
      }
    } catch {}
  };

  const handleCreateSubadmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newUsername.trim()) {
      setErrorMsg(t("usernameRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || t("createError"));
      } else {
        const pwdNotice = data.generatedPassword
          ? ` (${data.generatedPassword})`
          : "";
        setSuccessMsg(t("createSuccess", { username: newUsername, pwdNotice }));
        setNewUsername("");
        setNewPassword("");
        await fetchUsers();
      }
    } catch {
      setErrorMsg(t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: "active" | "disabled") => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active";
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || t("updateError"));
      } else {
        setSuccessMsg(t("updateSuccess"));
        await fetchUsers();
      }
    } catch {
      setErrorMsg(t("updateError"));
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!window.confirm(t("deleteConfirm", { username }))) {
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || t("deleteError"));
      } else {
        setSuccessMsg(t("deleteSuccess", { username }));
        await fetchUsers();
      }
    } catch {
      setErrorMsg(t("deleteError"));
    }
  };

  return (
    <div>
      {errorMsg && (
        <div style={{ padding: "0.75rem 1rem", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", marginBottom: "1rem", fontWeight: 500 }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: "0.75rem 1rem", background: "#dcfce7", color: "#166534", borderRadius: "6px", marginBottom: "1rem", fontWeight: 500 }}>
          {successMsg}
        </div>
      )}

      <div className={styles.createCard}>
        <h3>{t("createTitle")}</h3>
        <form onSubmit={handleCreateSubadmin} className={styles.createForm}>
          <div className={styles.formGroup}>
            <label>{t("usernameLabel")}</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={t("usernamePlaceholder")}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>{t("passwordLabel")}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
            />
          </div>
          <div className={styles.submitWrapper}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("tableHeaders.id")}</th>
              <th>{t("tableHeaders.username")}</th>
              <th>{t("tableHeaders.role")}</th>
              <th>{t("tableHeaders.status")}</th>
              <th>{t("tableHeaders.createdAt")}</th>
              <th>{t("tableHeaders.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: u.role === "admin" ? "#dbeafe" : "#fef3c7",
                      color: u.role === "admin" ? "#1e40af" : "#92400e",
                    }}
                  >
                    {u.role === "admin" ? rolesT("admin").toUpperCase() : rolesT("subadmin").toUpperCase()}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: u.status === "active" ? "#dcfce7" : "#fee2e2",
                      color: u.status === "active" ? "#166534" : "#991b1b",
                    }}
                  >
                    {u.status === "active" ? commonT("active").toUpperCase() : commonT("disabled").toUpperCase()}
                  </span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.role === "subadmin" ? (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        style={{
                          background: u.status === "active" ? "#f59e0b" : "#10b981",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        {u.status === "active" ? commonT("disable") : commonT("enable")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.username)}
                        style={{
                          background: "#ef4444",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        {commonT("delete")}
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{rolesT("primaryAdmin")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
