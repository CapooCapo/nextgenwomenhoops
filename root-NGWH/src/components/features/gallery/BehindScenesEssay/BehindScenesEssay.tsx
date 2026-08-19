import React from "react";
import { useLocale } from "next-intl";
import { BehindScenesStory } from "../../../../types/content";
import { Card } from "../../../ui/Card/Card";
import { PhotoThumbnail } from "../PhotoThumbnail/PhotoThumbnail";
import styles from "./BehindScenesEssay.module.scss";

interface BehindScenesEssayProps {
  story: BehindScenesStory;
}

export function BehindScenesEssay({ story }: BehindScenesEssayProps) {
  const locale = useLocale() as "en" | "vi";

  return (
    <Card className={styles.card}>
      {story.photo && (
        <div className={styles.imageWrapper}>
          <PhotoThumbnail photo={story.photo} />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{story.title[locale]}</h3>
        <p className={styles.body}>{story.body[locale]}</p>
      </div>
    </Card>
  );
}
