import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { ArticleDetail } from "@/components/features/news/ArticleDetail/ArticleDetail";
import { getArticleBySlug } from "@/services/contentService";
import { absoluteUrl } from "@/config/seo";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as "en" | "vi";
  const article = await getArticleBySlug(slug).catch(() => undefined);
  if (!article) {
    return { robots: { index: false, follow: false } };
  }

  const title = article.title[locale];
  const description = article.summary?.[locale] ?? article.body[locale].slice(0, 160);
  const canonical = `/news/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: article.publishedAt,
      ...(article.coverImage ? { images: [article.coverImage.src] } : {}),
    },
  };
}

async function ArticleJsonLd({ slug }: { slug: string }) {
  const locale = (await getLocale()) as "en" | "vi";
  const article = await getArticleBySlug(slug).catch(() => undefined);
  if (!article) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title[locale],
    description: article.summary?.[locale],
    datePublished: article.publishedAt,
    url: absoluteUrl(`/news/${article.slug}`),
    ...(article.coverImage ? { image: [absoluteUrl(article.coverImage.src)] } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Sprint 1 — REQ-NEWS-001/002/003 detail view. See .ai/lld/news.md §2/§3.
export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const { slug } = await params;
  return (
    <>
      <ArticleJsonLd slug={slug} />
      {await ArticleDetail({ slug })}
    </>
  );
}
