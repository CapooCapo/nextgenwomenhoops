import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getHotNews } from "../../../../services/contentService";
import { NewsArticle } from "../../../../types/content";
import { ArticleCard } from "../../news/ArticleCard/ArticleCard";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import { Container } from "../../../ui/Container/Container";
import styles from "./HotNewsList.module.scss";

export async function HotNewsList() {
  const t = await getTranslations("home.hotNews");
  let news: NewsArticle[] = [];
  let error = false;

  try {
    news = await getHotNews(5);
  } catch {
    error = true;
  }

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="hot-news-heading">
        <Container>
          <h2 id="hot-news-heading" className={styles.heading}>{t("heading")}</h2>
          <ErrorMessage message={t("error")} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="hot-news-heading">
      <Container>
        <div className={styles.headerRow}>
          <h2 id="hot-news-heading" className={styles.heading}>{t("heading")}</h2>
          {news.length > 0 && (
            <Link href="/news" className={styles.viewAll}>
              {t("viewAll")}
            </Link>
          )}
        </div>

        {news.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <div className={styles.grid}>
            {news.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
