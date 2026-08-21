// Centralized production URL for SEO metadata (canonical URLs, OG/Twitter
// URLs, sitemap/robots). Single source so the domain only needs updating
// here if it ever changes.
export const SITE_URL = "https://nextgenwomenhoops.onrender.com";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
