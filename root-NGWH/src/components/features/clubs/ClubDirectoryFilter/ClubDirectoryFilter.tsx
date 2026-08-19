"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Label } from "../../../ui/Label/Label";
import styles from "./ClubDirectoryFilter.module.scss";

interface ClubDirectoryFilterProps {
  regions: string[];
  selectedRegion?: string;
}

export function ClubDirectoryFilter({ regions, selectedRegion }: ClubDirectoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("clubs.directory");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set("region", value);
    } else {
      params.delete("region");
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  if (regions.length === 0) return null;

  return (
    <div className={styles.filterWrapper}>
      <div className={styles.filterGroup}>
        <Label htmlFor="region-filter" className={styles.label}>
          {t("filterLabel")}
        </Label>
        <select
          id="region-filter"
          className={styles.select}
          value={selectedRegion || ""}
          onChange={handleChange}
        >
          <option value="">{t("allRegions")}</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
