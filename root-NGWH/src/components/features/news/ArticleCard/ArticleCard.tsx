import React from "react";
import Link from "next/link";
import { useLocale, useTranslations, useFormatter } from "next-intl";
import { NewsArticle } from "../../../../types/content";
import { Card } from "../../../ui/Card/Card";
import styles from "./ArticleCard.module.scss";

interface ArticleCardProps {
  article: NewsArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const locale = useLocale() as "en" | "vi";
  const t = useTranslations("news.categories");
  const format = useFormatter();

  const formattedDate = format.dateTime(new Date(article.publishedAt), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card elevated className={styles.cardContainer}>
      <Link href={`/news/${article.slug}`} className={styles.link} aria-label={article.title[locale]}>
        {article.coverImage && (
          <div className={styles.imageWrapper}>
            <img 
              src={article.coverImage.src} 
              alt={article.coverImage.alt[locale]} 
              className={styles.image}
              loading="lazy"
            />
          </div>
        )}
        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={styles.category}>{t(article.category)}</span>
            <span className={styles.dot} aria-hidden="true">&bull;</span>
            <time dateTime={article.publishedAt} className={styles.date}>
              {formattedDate}
            </time>
          </div>
          <h3 className={styles.title}>{article.title[locale]}</h3>
          {article.summary && (
            <p className={styles.summary}>{article.summary[locale]}</p>
          )}
        </div>
      </Link>
    </Card>
  );
}
