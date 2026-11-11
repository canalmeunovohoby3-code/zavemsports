import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listCategories, listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/catalogo",
    "/sobre",
    "/guia-de-tamanhos",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const categories = listCategories().map((category) => ({
    url: `${base}/categoria/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const products = listProducts({ limit: 500 }).map((product) => ({
    url: `${base}/produto/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categories, ...products];
}
