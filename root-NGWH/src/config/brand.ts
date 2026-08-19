// Centralized brand values — REQ-BRAND-001 (name/abbreviation), REQ-BRAND-003
// (tagline). Every component needing these strings imports from here rather
// than hardcoding them, so a future OQ-002 confirmation only touches this
// file (see .ai/lld/home.md §15).
//
// DESIGN DECISION: the tagline is rendered identically in English and
// Vietnamese (not translated) — a brand tagline is an identity element, not
// editorial content, and no Vietnamese wording has been confirmed anywhere
// in the requirements workbook. Translating it here would be inventing
// content, not implementing a requirement.
export const BRAND = {
  name: "NextGen Women Hoops",
  abbreviation: "NG Women Hoops",
  tagline: "Where Tomorrow's Legends Rise",
} as const;
