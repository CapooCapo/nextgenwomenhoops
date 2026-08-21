import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container/Container";
import { ArticleList } from "@/components/features/news/ArticleList/ArticleList";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("pages.news.title");
  const description = t("seo.news.description");

  return {
    title,
    description,
    alternates: { canonical: "/news" },
    openGraph: { title, description, url: "/news", type: "website" },
  };
}

// Sprint 1 — REQ-NEWS-001/002/003. See .ai/lld/news.md. Three static
// per-category sections, no filter/pagination — neither is supported by
// any requirement (LLD §8).
export default async function NewsPage() {
  const t = await getTranslations();
  const [tournamentNews, inspirational, knowledgeNutrition] =
    await Promise.all([
      ArticleList({ category: "tournament_news" }),
      ArticleList({ category: "inspirational" }),
      ArticleList({ category: "knowledge_nutrition" }),
    ]);

  return (
    <>
      <Container>
        <h1 className={styles.title}>{t("pages.news.title")}</h1>
      </Container>
      {tournamentNews}
      {inspirational}
      {knowledgeNutrition}
    </>
  );
}
