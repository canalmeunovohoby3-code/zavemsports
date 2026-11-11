import {
  demoCategories,
  demoHomeSections,
  demoProducts,
  demoSettings,
} from "@/lib/demo-data";
import type { ListProductsOptions } from "@/lib/queries";
import type {
  Category,
  HomeSection,
  OrderDetail,
  ProductDetail,
  ProductSummary,
} from "@/lib/types";
import { isStoreDemoMode } from "@/lib/store-mode";

export { isStoreDemoMode } from "@/lib/store-mode";

export async function getStoreSettings() {
  if (isStoreDemoMode()) return { ...demoSettings };
  const { getSettings } = await import("@/lib/settings");
  return getSettings();
}

export async function getStoreCategories(options?: {
  includeInactive?: boolean;
  countActiveOnly?: boolean;
}): Promise<Category[]> {
  if (isStoreDemoMode()) {
    return options?.includeInactive
      ? demoCategories
      : demoCategories.filter((category) => category.isActive);
  }
  const { listCategories } = await import("@/lib/queries");
  return listCategories(options);
}

export async function getStoreProducts(
  options?: ListProductsOptions,
): Promise<ProductSummary[]> {
  if (isStoreDemoMode()) return demoProducts;
  const { listProducts } = await import("@/lib/queries");
  return listProducts(options);
}

export async function getStoreAvailableSizes(): Promise<string[]> {
  if (isStoreDemoMode()) return [];
  const { listAvailableSizes } = await import("@/lib/queries");
  return listAvailableSizes();
}

export async function getStoreAvailableSizesByCategory(
  categoryId: number,
): Promise<string[]> {
  if (isStoreDemoMode()) return [];
  const { listAvailableSizesByCategory } = await import("@/lib/queries");
  return listAvailableSizesByCategory(categoryId);
}

export async function getStoreCategoryBySlug(
  slug: string,
  includeInactive = false,
): Promise<Category | null> {
  if (isStoreDemoMode()) {
    return (
      demoCategories.find(
        (category) =>
          category.slug === slug &&
          (includeInactive || category.isActive),
      ) ?? null
    );
  }
  const { getCategoryBySlug } = await import("@/lib/queries");
  return getCategoryBySlug(slug, includeInactive);
}

export async function getStoreProductBySlug(
  slug: string,
  includeInactive = false,
): Promise<ProductDetail | null> {
  if (isStoreDemoMode()) return null;
  const { getProductBySlug } = await import("@/lib/queries");
  return getProductBySlug(slug, includeInactive);
}

export async function getStoreRelatedProducts(
  categoryId: number,
  currentProductId: number,
  limit = 4,
): Promise<ProductSummary[]> {
  if (isStoreDemoMode()) return [];
  const { getRelatedProducts } = await import("@/lib/queries");
  return getRelatedProducts(categoryId, currentProductId, limit);
}

export async function getStoreHomeSectionsForHome(): Promise<HomeSection[]> {
  if (isStoreDemoMode()) {
    return demoHomeSections.filter((section) => section.isActive);
  }
  const { listHomeSectionsForHome } = await import("@/lib/queries");
  return listHomeSectionsForHome();
}

export async function getStoreOrderByToken(
  token: string,
): Promise<OrderDetail | null> {
  if (isStoreDemoMode()) return null;
  const { getOrderByToken } = await import("@/lib/queries");
  return getOrderByToken(token);
}

export async function findStoreOrderForTracking(
  orderNumber: string,
  email: string,
): Promise<OrderDetail | null> {
  if (isStoreDemoMode()) return null;
  const { findOrderForTracking } = await import("@/lib/queries");
  return findOrderForTracking(orderNumber, email);
}
