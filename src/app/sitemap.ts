import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

const STATIC_PATHS = [
  "",
  "/about",
  "/doctor",
  "/medical",
  "/hours",
  "/access",
  "/facility",
  "/news",
  "/faq",
  "/recruit",
  "/contact",
  "/reserve",
  "/downloads",
  "/links",
  "/column",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const news = await prisma.newsPost.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
    });
    newsEntries = news.map((n) => ({
      url: `${siteUrl}/news/${n.id}`,
      lastModified: n.updatedAt,
    }));
  } catch {
    newsEntries = [];
  }

  return [...staticEntries, ...newsEntries];
}
