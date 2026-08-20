"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminSeasonsPage() {
  const router = useRouter();
  const t = useTranslations("admin.seasons");

  useEffect(() => {
    router.replace("/admin/matches");
  }, [router]);

  return (
    <div style={{ color: "#94a3b8", padding: "3rem", textAlign: "center" }}>
      {t("redirecting")}
    </div>
  );
}
