"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BRAND } from "../../../../config/brand";
import { markRegistrationIntroSeenAction } from "@/app/(public)/club-registration/introActions";
import styles from "./RegistrationIntro.module.scss";
// If BRAND_ASSETS existed we would import it, but we'll use text for now to avoid errors if not set up

interface RegistrationIntroProps {
  onComplete: () => void;
}

export function RegistrationIntro({ onComplete }: RegistrationIntroProps) {
  const t = useTranslations("clubRegistration.intro");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fire and forget server action to set cookie
    markRegistrationIntroSeenAction().catch(console.error);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReducedMotion ? 400 : 2200;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.intro} aria-hidden="true" data-testid="registration-intro">
      <div className={styles.brand}>
        <span className={styles.mark}>{BRAND.abbreviation}</span>
        <span className={styles.name}>{BRAND.name}</span>
      </div>
      <p className={styles.title}>{t("title")}</p>
    </div>
  );
}
