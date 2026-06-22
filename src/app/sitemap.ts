import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/vitrine"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/captura"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/privacidade"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const properties = await prisma.property.findMany({
    where: { isPublished: true, status: "DISPONIVEL" },
    select: { code: true, updatedAt: true, publishedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: absoluteUrl(`/vitrine/${property.code}`),
    lastModified: property.updatedAt ?? property.publishedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...propertyPages];
}
