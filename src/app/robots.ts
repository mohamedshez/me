import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: `${process.env.SITE_URL || "https://www.shez.app"}/sitemap.xml` };
}
