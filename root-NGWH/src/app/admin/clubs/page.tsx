"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface ClubItem {
  id: number;
  name: string;
  province_region: string;
  representative_name: string;
  is_approved: boolean;
  logo: string | null;
  founding_year: number | null;
}

export default function AdminClubsPage() {
  const t = useTranslations("admin.clubs");
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    let active = true;

    let url = `/api/admin/clubs?page=${page}&limit=${pageSize}`;
    const params = new URLSearchParams();
    if (filter === "approved") params.append("approved", "true");
    if (filter === "pending") params.append("approved", "false");
    if (searchQuery.trim()) params.append("search", searchQuery.trim());

    if (params.toString()) {
      url += `&${params.toString()}`;
    }

    fetch(url)
      .then((res) => (res.ok ? res.json() : { clubs: [], totalPages: 1, total: 0, page: 1 }))
      .then((data) => {
        if (active) {
          setClubs(data.clubs || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
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
  }, [page, filter, searchQuery]);

  function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilter(e.target.value);
    setPage(1);
  }

  function handleSearchClick() {
    setPage(1);
    setSearchQuery(search);
  }

  async function toggleApproval(id: number, currentApproved: boolean) {
    try {
      const res = await fetch(`/api/admin/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: !currentApproved }),
      });
      if (res.ok) {
        // Trigger refetch by re-setting page or search query
        setPage((p) => p);
        const url = `/api/admin/clubs?page=${page}&limit=${pageSize}${
          filter === "approved" ? "&approved=true" : filter === "pending" ? "&approved=false" : ""
        }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`;
        const refreshed = await fetch(url);
        if (refreshed.ok) {
          const data = await refreshed.json();
          setClubs(data.clubs || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this club?")) return;
    try {
      const res = await fetch(`/api/admin/clubs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (clubs.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          const url = `/api/admin/clubs?page=${page}&limit=${pageSize}${
            filter === "approved" ? "&approved=true" : filter === "pending" ? "&approved=false" : ""
          }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""}`;
          const refreshed = await fetch(url);
          if (refreshed.ok) {
            const data = await refreshed.json();
            setClubs(data.clubs || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
          }
        }
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

      <div className={styles.filterBar}>
        <select value={filter} onChange={handleFilterChange}>
          <option value="all">{t("all")}</option>
          <option value="approved">{t("approved")}</option>
          <option value="pending">{t("pending")}</option>
        </select>

        <input
          type="text"
          placeholder="Search by club name or region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchClick();
          }}
        />
        <button type="button" onClick={handleSearchClick} className={styles.btnPrimary}>
          Search
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading clubs...</div>
        ) : clubs.length === 0 ? (
          <div className={styles.emptyState}>No clubs found.</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Club Name</th>
                  <th>Region</th>
                  <th>Representative</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr key={club.id}>
                    <td>{club.id}</td>
                    <td>
                      <strong>{club.name}</strong>
                    </td>
                    <td>{club.province_region}</td>
                    <td>{club.representative_name || "-"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          club.is_approved ? styles.approved : styles.pending
                        }`}
                      >
                        {club.is_approved ? t("approved") : t("pending")}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => toggleApproval(club.id, club.is_approved)}
                          className={club.is_approved ? styles.btnSecondary : styles.btnSuccess}
                        >
                          {club.is_approved ? t("revoke") : t("approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(club.id)}
                          className={styles.btnDanger}
                        >
                          {t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total clubs)
              </div>
              <div className={styles.paginationControls}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
