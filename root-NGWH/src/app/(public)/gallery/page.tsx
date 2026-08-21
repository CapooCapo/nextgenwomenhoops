import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { MediaAlbum } from "@/components/features/gallery/MediaAlbum/MediaAlbum";
import { MVPSpotlightCard } from "@/components/features/gallery/MVPSpotlightCard/MVPSpotlightCard";
import { BehindScenesSection } from "@/components/features/gallery/BehindScenesSection/BehindScenesSection";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("pages.gallery.title");
  const description = t("seo.gallery.description");

  return {
    title,
    description,
    alternates: { canonical: "/gallery" },
    openGraph: { title, description, url: "/gallery", type: "website" },
  };
}

// Sprint 1 — REQ-GALLERY-001 (photo slice only), REQ-GALLERY-002,
// REQ-GALLERY-003. See .ai/lld/gallery.md. REQ-GALLERY-001's video half
// has no Open Question tracking it and is intentionally not implemented.
export default async function GalleryPage() {
  const t = await getTranslations();
  const [media, mvp, behindScenes] = await Promise.all([
    MediaAlbum(),
    MVPSpotlightCard(),
    BehindScenesSection(),
  ]);

  return (
    <>
      <Container>
        <h1 className={styles.title}>{t("pages.gallery.title")}</h1>
      </Container>
      {media}
      {mvp}
      {behindScenes}
    </>
  );
}
