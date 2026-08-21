import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo";
import { getApprovedClubsList } from "@/server/services/clubsServerService";
import { getNewsByCategory } from "@/services/contentService";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/clubs", changeFrequency: "daily", priority: 0.8 },
  { path: "/news", changeFrequency: "daily", priority: 0.8 },
  { path: "/tournaments", changeFrequency: "weekly", priority: 0.7 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/club-registration", changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let clubEntries: MetadataRoute.Sitemap = [];
  try {
    const { data: clubs } = await getApprovedClubsList({ limit: 1000 });
    clubEntries = clubs.map((club) => ({
      url: `${SITE_URL}/clubs/${club.id}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    clubEntries = [];
  }

  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = ["tournament_news", "inspirational", "knowledge_nutrition"] as const;
    const articleLists = await Promise.all(categories.map((c) => getNewsByCategory(c)));
    newsEntries = articleLists.flat().map((article) => ({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    newsEntries = [];
  }

  return [...staticEntries, ...clubEntries, ...newsEntries];
}
