import type { Partner } from "@/types/content";

// No organizing-committee or partner entries are confirmed anywhere in
// Requirement_Analysis.xlsx or Giai doan 1.docx. Inventing a specific
// organization or person's name here would fabricate business data
// (RULES.md R006) — same reasoning as CHAMPION_FIXTURE (Home).
// PartnersSection renders its designed empty state until a real entry is
// supplied (.ai/lld/about.md §15).
export const PARTNERS_FIXTURE: Partner[] = [];
