"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "../adminTables.module.scss";

interface ArticleItem {
  id: number;
  title: string;
  category: string;
  summary: string;
  created_at: string;
}

export default function AdminNewsPage() {
  const t = useTranslations("admin.news");
  const commonT = useTranslations("admin.common");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/news")
      .then((res) => (res.ok ? res.json() : { articles: [] }))
      .then((data) => {
        if (active) {
          setArticles(data.articles || []);
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

  async function handleDeleteArticle(id: number) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>{t("title")}</h1>
        <Link href="/admin/news/new" className={styles.btnSuccess} style={{ textDecoration: "none", padding: "0.5rem 1rem", borderRadius: "6px" }}>
          {t("createArticle")}
        </Link>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : articles.length === 0 ? (
          <div className={styles.emptyState}>{t("empty")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("tableHeaders.id")}</th>
                <th>{t("tableHeaders.title")}</th>
                <th>{t("tableHeaders.category")}</th>
                <th>{t("tableHeaders.summary")}</th>
                <th>{t("tableHeaders.createdAt")}</th>
                <th>{t("tableHeaders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.summary || "-"}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionsCell}>
                      <Link
                        href={`/admin/news/${item.id}/edit`}
                        className={styles.btnSecondary}
                        style={{ textDecoration: "none", display: "inline-block" }}
                      >
                        {commonT("edit")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(item.id)}
                        className={styles.btnDanger}
                      >
                        {commonT("delete")}
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
