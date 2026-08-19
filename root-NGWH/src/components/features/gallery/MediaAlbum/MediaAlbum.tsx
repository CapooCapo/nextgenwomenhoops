import React from "react";
import { getTranslations } from "next-intl/server";
import { getChampionshipPhotos } from "../../../../services/contentService";
import { LocalizedText } from "../../../../types/content";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { PhotoThumbnail } from "../PhotoThumbnail/PhotoThumbnail";
import styles from "./MediaAlbum.module.scss";

export async function MediaAlbum() {
  const t = await getTranslations("gallery.media");
  let photos: { src: string; alt: LocalizedText }[] = [];
  let error = false;

  try {
    photos = getChampionshipPhotos();
  } catch {
    error = true;
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="media-album-heading">
        <Container>
          <h2 id="media-album-heading" className={styles.heading}>{t("heading")}</h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="media-album-heading">
      <Container>
        <h2 id="media-album-heading" className={styles.heading}>{t("heading")}</h2>
        
        {photos.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <div className={styles.grid}>
            {photos.map((photo, index) => (
              <PhotoThumbnail key={index} photo={photo} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
