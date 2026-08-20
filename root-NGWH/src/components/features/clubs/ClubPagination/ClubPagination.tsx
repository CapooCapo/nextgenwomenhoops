"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "../../../ui/Button/Button";
import styles from "./ClubPagination.module.scss";

interface ClubPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ClubPagination({ currentPage, totalPages }: ClubPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("clubs.directory");

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={styles.paginationNav} aria-label="Pagination Navigation">
      <Button
        variant="secondary"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className={styles.pageBtn}
      >
        {t("previous")}
      </Button>

      <div className={styles.pageNumbers}>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            className={`${styles.pageNumberBtn} ${
              p === currentPage ? styles.activePage : ""
            }`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={styles.pageBtn}
      >
        {t("next")}
      </Button>
    </nav>
  );
}
