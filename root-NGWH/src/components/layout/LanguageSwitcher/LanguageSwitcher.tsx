"use client";

import React, { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "../../../i18n/actions";
import styles from "./LanguageSwitcher.module.scss";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;
    startTransition(async () => {
      await setLocaleAction(newLocale);
      router.refresh();
    });
  };

  return (
    <div className={styles.switcher} aria-label={t("languageSwitcherLabel")}>
      <button
        className={`${styles.button} ${locale === "en" ? styles.active : ""}`}
        onClick={() => handleLocaleChange("en")}
        disabled={isPending}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <span className={styles.divider} aria-hidden="true">|</span>
      <button
        className={`${styles.button} ${locale === "vi" ? styles.active : ""}`}
        onClick={() => handleLocaleChange("vi")}
        disabled={isPending}
        aria-pressed={locale === "vi"}
      >
        VI
      </button>
    </div>
  );
}
