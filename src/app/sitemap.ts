import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import {
  getStoreCategories,
  getStoreProducts,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const categories = (await getStoreCategories()).map((category) => ({
    url: `${base}/categoria/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const products = (await getStoreProducts({ limit: 500 })).map((product) => ({
    url: `${base}/produto/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categories, ...products];
}
