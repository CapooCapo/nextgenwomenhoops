import React from "react";
import { useLocale } from "next-intl";
import { LocalizedText } from "../../../../types/content";
import styles from "./PhotoThumbnail.module.scss";

interface PhotoThumbnailProps {
  photo: {
    src: string;
    alt: LocalizedText;
  };
}

export function PhotoThumbnail({ photo }: PhotoThumbnailProps) {
  const locale = useLocale() as "en" | "vi";
  
  return (
    <div className={styles.wrapper}>
      <img
        src={photo.src}
        alt={photo.alt[locale]}
        className={styles.image}
        loading="lazy"
      />
    </div>
  );
}
