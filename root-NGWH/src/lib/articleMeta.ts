import type { NewsArticle } from "@/types/content";

interface FormatArticleMetaParams {
  article: NewsArticle;
  t: (key: string) => string;
  formatDate: (date: Date) => string;
}

interface ArticleMeta {
  categoryLabel: string;
  formattedDate: string;
}

/**
 * Translated category label + formatted published date — ArticleList
 * and ArticleDetail each resolved this identical "category · date" pair
 * separately. `t`/`formatDate` are passed in rather than called here so
 * this stays a plain formatting helper, not another i18n entry point.
 */
export function formatArticleMeta({
  article,
  t,
  formatDate,
}: FormatArticleMetaParams): ArticleMeta {
  return {
    categoryLabel: t(`news.categories.${article.category}`),
    formattedDate: formatDate(new Date(article.publishedAt)),
  };
}
