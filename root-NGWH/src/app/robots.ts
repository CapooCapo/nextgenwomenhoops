import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/api",
        "/dashboard",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/obs",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
