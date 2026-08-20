import { ArticleDetail } from "@/components/features/news/ArticleDetail/ArticleDetail";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Sprint 1 — REQ-NEWS-001/002/003 detail view. See .ai/lld/news.md §2/§3.
export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const { slug } = await params;
  return await ArticleDetail({ slug });
}
