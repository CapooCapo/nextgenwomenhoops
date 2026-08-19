// Sitemap navigation — one entry per confirmed page (Requirement_Analysis.xlsx
// modules: HOME, ABOUT, TOURN, GALLERY, CLUB, REG, NEWS, CONTACT). Labels
// come from messages/{locale}.json under the "nav" namespace (see
// SiteHeader), keyed here rather than hardcoded so both locales render
// correctly from the same list.
export interface NavItem {
  href: string;
  messageKey:
    | "home"
    | "about"
    | "tournaments"
    | "gallery"
    | "clubs"
    | "clubRegistration"
    | "news"
    | "contact";
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", messageKey: "home" },
  { href: "/about", messageKey: "about" },
  { href: "/tournaments", messageKey: "tournaments" },
  { href: "/gallery", messageKey: "gallery" },
  { href: "/clubs", messageKey: "clubs" },
  { href: "/club-registration", messageKey: "clubRegistration" },
  { href: "/news", messageKey: "news" },
  { href: "/contact", messageKey: "contact" },
];
