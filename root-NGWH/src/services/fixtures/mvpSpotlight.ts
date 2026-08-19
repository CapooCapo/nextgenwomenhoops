import type { MvpSpotlight } from "@/types/content";

// No MVP record is confirmed anywhere in the requirements workbook.
// Naming a specific player would fabricate business data (RULES.md R006)
// — same reasoning as CHAMPION_FIXTURE. MVPSpotlightCard renders its
// designed empty state instead (.ai/lld/gallery.md §9).
export const MVP_SPOTLIGHT_FIXTURE: MvpSpotlight | null = null;
