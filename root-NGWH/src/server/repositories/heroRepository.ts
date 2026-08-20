import { query, queryOne } from "../db/client";
import { HERO_VIDEO_SLIDES } from "@/config/heroSlides";

export interface HeroSlideRow {
  id: number;
  slide_id: string;
  title: string;
  description: string;
  video_src: string;
  poster_src: string;
  cta_label: string;
  cta_link: string;
  display_order: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function ensureHeroTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      slide_id VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(255) DEFAULT '',
      description TEXT DEFAULT '',
      video_src TEXT DEFAULT '',
      poster_src TEXT DEFAULT '',
      cta_label VARCHAR(100) DEFAULT '',
      cta_link VARCHAR(255) DEFAULT '/tournaments',
      display_order INT DEFAULT 0,
      is_enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const countRes = await query<{ count: string }>("SELECT COUNT(*) FROM hero_slides");
  const count = parseInt(countRes[0]?.count || "0", 10);

  if (count === 0) {
    for (let i = 0; i < HERO_VIDEO_SLIDES.length; i++) {
      const slide = HERO_VIDEO_SLIDES[i];
      await query(
        `INSERT INTO hero_slides (slide_id, title, video_src, display_order, is_enabled)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (slide_id) DO NOTHING`,
        [slide.id, slide.title || "", slide.videoSrc, i + 1]
      );
    }
  }
}

export async function findAllHeroSlides(): Promise<HeroSlideRow[]> {
  await ensureHeroTable();
  return query<HeroSlideRow>(
    `SELECT * FROM hero_slides ORDER BY display_order ASC, updated_at DESC, id ASC`
  );
}

export async function findEnabledHeroSlides(): Promise<HeroSlideRow[]> {
  await ensureHeroTable();
  return query<HeroSlideRow>(
    `SELECT * FROM hero_slides WHERE is_enabled = true ORDER BY display_order ASC, updated_at DESC, id ASC`
  );
}

export async function reorderHeroSlides(
  orders: { id: number; display_order: number }[]
): Promise<boolean> {
  await ensureHeroTable();
  for (const item of orders) {
    await query(
      `UPDATE hero_slides SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [item.display_order, item.id]
    );
  }
  return true;
}

export async function createHeroSlide(data: {
  slide_id: string;
  title?: string;
  description?: string;
  video_src: string;
  poster_src?: string;
  cta_label?: string;
  cta_link?: string;
  display_order?: number;
  is_enabled?: boolean;
}): Promise<HeroSlideRow> {
  await ensureHeroTable();
  const rows = await query<HeroSlideRow>(
    `INSERT INTO hero_slides (slide_id, title, description, video_src, poster_src, cta_label, cta_link, display_order, is_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.slide_id,
      data.title || "",
      data.description || "",
      data.video_src,
      data.poster_src || "",
      data.cta_label || "",
      data.cta_link || "/tournaments",
      data.display_order ?? 0,
      data.is_enabled ?? true,
    ]
  );
  return rows[0];
}

export async function updateHeroSlide(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    video_src: string;
    poster_src: string;
    cta_label: string;
    cta_link: string;
    display_order: number;
    is_enabled: boolean;
  }>
): Promise<HeroSlideRow | null> {
  await ensureHeroTable();

  const existing = await queryOne<HeroSlideRow>(
    `SELECT * FROM hero_slides WHERE id = $1`,
    [id]
  );
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const description = data.description ?? existing.description;
  const video_src = data.video_src ?? existing.video_src;
  const poster_src = data.poster_src ?? existing.poster_src;
  const cta_label = data.cta_label ?? existing.cta_label;
  const cta_link = data.cta_link ?? existing.cta_link;
  const display_order = data.display_order ?? existing.display_order;
  const is_enabled = data.is_enabled ?? existing.is_enabled;

  const rows = await query<HeroSlideRow>(
    `UPDATE hero_slides
     SET title = $1, description = $2, video_src = $3, poster_src = $4, cta_label = $5, cta_link = $6, display_order = $7, is_enabled = $8, updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING *`,
    [title, description, video_src, poster_src, cta_label, cta_link, display_order, is_enabled, id]
  );
  return rows[0];
}

export async function deleteHeroSlide(id: number): Promise<boolean> {
  await ensureHeroTable();
  const rows = await query(`DELETE FROM hero_slides WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
