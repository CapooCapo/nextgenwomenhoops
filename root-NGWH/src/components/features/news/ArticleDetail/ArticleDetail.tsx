import React from "react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, getFormatter } from "next-intl/server";
import { getArticleBySlug } from "../../../../services/contentService";
import { Container } from "../../../ui/Container/Container";
import { ErrorMessage } from "../../../ui/ErrorMessage/ErrorMessage";
import styles from "./ArticleDetail.module.scss";

interface ArticleDetailProps {
  slug: string;
}

export async function ArticleDetail({ slug }: ArticleDetailProps) {
  const locale = (await getLocale()) as "en" | "vi";
  const tCategory = await getTranslations("news.categories");
  const tDetail = await getTranslations("news.detail");
  const format = await getFormatter();

  let article;
  let error = false;

  try {
    article = getArticleBySlug(slug);
  } catch (err) {
    error = true;
  }

  if (error) {
    return (
      <Container className={styles.container}>
        <ErrorMessage message={tDetail("error")} />
      </Container>
    );
  }

  if (!article) {
    notFound();
    return null;
  }

  const formattedDate = format.dateTime(new Date(article.publishedAt), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className={styles.article}>
      <Container className={styles.container}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.category}>{tCategory(article.category)}</span>
            <span className={styles.dot} aria-hidden="true">&bull;</span>
            <time dateTime={article.publishedAt} className={styles.date}>
              {formattedDate}
            </time>
          </div>
          <h1 className={styles.title}>{article.title[locale]}</h1>
        </header>

        {article.coverImage && (
          <div className={styles.imageWrapper}>
            <img
              src={article.coverImage.src}
              alt={article.coverImage.alt[locale]}
              className={styles.image}
              loading="eager"
            />
          </div>
        )}

        <div className={styles.body}>
          <p>{article.body[locale]}</p>
        </div>
      </Container>
    </article>
  );
}
