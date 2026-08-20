import { query } from "../db/client";

export interface NewsArticleRow {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface GalleryItemRow {
  id: number;
  title: string;
  category: string;
  media_type: string;
  media_url: string;
  caption: string | null;
  created_at: string;
}

export interface ContactSubmissionRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export async function ensureContentTables(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS news_articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'tournament_news',
      summary TEXT DEFAULT '',
      content TEXT DEFAULT '',
      image_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'media',
      media_type VARCHAR(50) DEFAULT 'image',
      media_url TEXT NOT NULL,
      caption TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) DEFAULT '',
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// News Repositories
export async function findAllNews(): Promise<NewsArticleRow[]> {
  await ensureContentTables();
  return query<NewsArticleRow>(`SELECT * FROM news_articles ORDER BY id DESC`);
}

export async function createNewsArticle(data: {
  title: string;
  category: string;
  summary?: string;
  content?: string;
  image_url?: string | null;
}): Promise<NewsArticleRow> {
  await ensureContentTables();
  const rows = await query<NewsArticleRow>(
    `INSERT INTO news_articles (title, category, summary, content, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.title, data.category, data.summary || "", data.content || "", data.image_url || null]
  );
  return rows[0];
}

export async function findNewsById(id: number): Promise<NewsArticleRow | null> {
  await ensureContentTables();
  const rows = await query<NewsArticleRow>(`SELECT * FROM news_articles WHERE id = $1`, [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function updateNewsArticle(
  id: number,
  data: {
    title?: string;
    category?: string;
    summary?: string;
    content?: string;
    image_url?: string | null;
  }
): Promise<NewsArticleRow | null> {
  await ensureContentTables();
  const existing = await findNewsById(id);
  if (!existing) return null;

  const title = data.title !== undefined ? data.title : existing.title;
  const category = data.category !== undefined ? data.category : existing.category;
  const summary = data.summary !== undefined ? data.summary : existing.summary;
  const content = data.content !== undefined ? data.content : existing.content;
  const image_url = data.image_url !== undefined ? data.image_url : existing.image_url;

  const rows = await query<NewsArticleRow>(
    `UPDATE news_articles
     SET title = $1, category = $2, summary = $3, content = $4, image_url = $5
     WHERE id = $6
     RETURNING *`,
    [title, category, summary, content, image_url, id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function deleteNewsArticle(id: number): Promise<boolean> {
  await ensureContentTables();
  const rows = await query(`DELETE FROM news_articles WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

export function generateSlug(id: number | string, title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return cleanTitle ? `${id}-${cleanTitle}` : `${id}`;
}

export function mapNewsArticleRowToNewsArticle(row: NewsArticleRow): import("@/types/content").NewsArticle {
  const publishedAtIso = row.created_at
    ? new Date(row.created_at).toISOString()
    : new Date().toISOString();

  const category: import("@/types/content").NewsCategory =
    row.category === "inspirational" || row.category === "knowledge_nutrition"
      ? row.category
      : "tournament_news";

  return {
    id: String(row.id),
    slug: generateSlug(row.id, row.title),
    category,
    publishedAt: publishedAtIso,
    title: {
      en: row.title,
      vi: row.title,
    },
    summary: {
      en: row.summary || "",
      vi: row.summary || "",
    },
    body: {
      en: row.content || "",
      vi: row.content || "",
    },
    coverImage: row.image_url
      ? {
          src: row.image_url,
          alt: {
            en: row.title,
            vi: row.title,
          },
        }
      : undefined,
  };
}

export async function findNewsByCategory(category: string): Promise<NewsArticleRow[]> {
  await ensureContentTables();
  return query<NewsArticleRow>(
    `SELECT * FROM news_articles WHERE category = $1 ORDER BY id DESC`,
    [category]
  );
}

export async function findNewsBySlugOrId(slug: string): Promise<NewsArticleRow | null> {
  await ensureContentTables();
  const allArticles = await findAllNews();
  const found = allArticles.find(
    (row) =>
      generateSlug(row.id, row.title) === slug ||
      String(row.id) === slug ||
      slug.startsWith(`${row.id}-`)
  );
  return found || null;
}

// Gallery Repositories
export async function findAllGalleryItems(): Promise<GalleryItemRow[]> {
  await ensureContentTables();
  return query<GalleryItemRow>(`SELECT * FROM gallery_items ORDER BY id DESC`);
}

export async function createGalleryItem(data: {
  title: string;
  category?: string;
  media_type?: string;
  media_url: string;
  caption?: string | null;
}): Promise<GalleryItemRow> {
  await ensureContentTables();
  const rows = await query<GalleryItemRow>(
    `INSERT INTO gallery_items (title, category, media_type, media_url, caption)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.title, data.category || "media", data.media_type || "image", data.media_url, data.caption || null]
  );
  return rows[0];
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
  await ensureContentTables();
  const rows = await query(`DELETE FROM gallery_items WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

// Contact Repositories
export async function findAllContactSubmissions(): Promise<ContactSubmissionRow[]> {
  await ensureContentTables();
  return query<ContactSubmissionRow>(`SELECT * FROM contact_submissions ORDER BY id DESC`);
}

export async function createContactSubmission(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<ContactSubmissionRow> {
  await ensureContentTables();
  const rows = await query<ContactSubmissionRow>(
    `INSERT INTO contact_submissions (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.email, data.subject || "", data.message]
  );
  return rows[0];
}

export async function deleteContactSubmission(id: number): Promise<boolean> {
  await ensureContentTables();
  const rows = await query(`DELETE FROM contact_submissions WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
