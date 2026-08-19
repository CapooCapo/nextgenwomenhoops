import React from "react";
import { getTranslations } from "next-intl/server";
import { getNewsByCategory } from "../../../../services/contentService";
import { NewsArticle, NewsCategory } from "../../../../types/content";
import { ArticleCard } from "../ArticleCard/ArticleCard";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import styles from "./ArticleList.module.scss";

interface ArticleListProps {
  category: NewsCategory;
}

export async function ArticleList({ category }: ArticleListProps) {
  const tCategory = await getTranslations("news.categories");
  const tListing = await getTranslations("news.listing");
  let articles: NewsArticle[] = [];
  let error = false;

  try {
    articles = getNewsByCategory(category);
  } catch {
    error = true;
  }

  const headingId = `news-list-${category}`;
  const headingText = tCategory(category);

  if (error) {
    return (
      <section className={styles.section} aria-labelledby={headingId}>
        <Container>
          <h2 id={headingId} className={styles.heading}>{headingText}</h2>
          <ErrorMessage message={tListing("error")} />
        </Container>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <Container>
        <h2 id={headingId} className={styles.heading}>{headingText}</h2>
        
        {articles.length === 0 ? (
          <p className={styles.empty}>{tListing("empty")}</p>
        ) : (
          <div className={styles.grid}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
