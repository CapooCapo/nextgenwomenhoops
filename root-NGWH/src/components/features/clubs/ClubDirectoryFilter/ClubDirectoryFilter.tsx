"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Label } from "../../../ui/Label/Label";
import { Input } from "../../../ui/Input/Input";
import { Button } from "../../../ui/Button/Button";
import styles from "./ClubDirectoryFilter.module.scss";

interface ClubDirectoryFilterProps {
  regions: string[];
  selectedRegion?: string;
  searchQuery?: string;
}

export function ClubDirectoryFilter({
  regions,
  selectedRegion,
  searchQuery = "",
}: ClubDirectoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("clubs.directory");

  const [searchTerm, setSearchTerm] = useState(searchQuery);

  const applyFilters = (newRegion?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const regionVal = newRegion !== undefined ? newRegion : selectedRegion;
    const searchVal = newSearch !== undefined ? newSearch : searchTerm;

    if (regionVal) {
      params.set("region", regionVal);
    } else {
      params.delete("region");
    }

    if (searchVal && searchVal.trim()) {
      params.set("search", searchVal.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyFilters(e.target.value, undefined);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(undefined, searchTerm);
  };

  return (
    <div className={styles.filterWrapper}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <Input
          type="text"
          id="club-search"
          name="search"
          placeholder={t("searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <Button type="submit" variant="primary" className={styles.searchBtn}>
          {t("searchButton")}
        </Button>
      </form>

      {regions.length > 0 && (
        <div className={styles.filterGroup}>
          <Label htmlFor="region-filter" className={styles.label}>
            {t("filterLabel")}
          </Label>
          <select
            id="region-filter"
            className={styles.select}
            value={selectedRegion || ""}
            onChange={handleRegionChange}
          >
            <option value="">{t("allRegions")}</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
