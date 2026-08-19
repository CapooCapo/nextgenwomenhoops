import type { LocalizedText } from "@/types/content";

// No championship photos are confirmed anywhere in Requirement_Analysis.xlsx
// or Giai doan 1.docx. Depicting a "real" event photo without a confirmed
// source would fabricate business data (RULES.md R006) — same reasoning as
// CHAMPION_FIXTURE. MediaAlbum renders its designed empty state instead
// (.ai/lld/gallery.md §9).
export const CHAMPIONSHIP_PHOTOS_FIXTURE: Array<{
  src: string;
  alt: LocalizedText;
}> = [];
