import { siteConfig } from "@/config/site";
import { editorial } from "@/config/editorial";
import { defaultStoreSettings } from "@/lib/store-settings";
import type { Category, HomeSection, ProductSummary } from "@/lib/types";

const createdAt = "2026-11-11T00:00:00.000Z";

export const demoCategories: Category[] = siteConfig.categories.map(
  (category, index) => ({
    id: index + 1,
    name: category.name,
    slug: category.slug,
    description: category.description,
    audience: category.audience,
    kind: category.kind,
    imageUrl:
      editorial.categoryFallbacks[category.slug] ??
      editorial.typeImages[category.kind],
    sortOrder: category.sortOrder,
    isActive: true,
    productCount: 0,
  }),
);

function categoryId(slug: string) {
  return demoCategories.find((category) => category.slug === slug)?.id ?? null;
}

export const demoHomeSections: HomeSection[] = [
  {
    id: 1,
    slug: "mais-vendidos",
    title: "Mais vendidos",
    subtitle: "As peças que mais saem na ZEVEN.",
    imageUrl: "",
    sourceMode: "best_sellers",
    sourceCategoryId: null,
    sourceCategorySlug: null,
    sourceAudience: null,
    isActive: true,
    sortOrder: 1,
    createdAt,
    updatedAt: createdAt,
    productIds: [],
    products: [],
  },
  {
    id: 2,
    slug: "novidades",
    title: "Novidades",
    subtitle: "As peças mais recentes cadastradas na loja.",
    imageUrl: "",
    sourceMode: "new_arrivals",
    sourceCategoryId: null,
    sourceCategorySlug: null,
    sourceAudience: null,
    isActive: true,
    sortOrder: 2,
    createdAt,
    updatedAt: createdAt,
    productIds: [],
    products: [],
  },
  {
    id: 3,
    slug: "camisetas-adulto",
    title: "Camisetas Adulto",
    subtitle: "Básicos de algodão para acompanhar o dia a dia.",
    imageUrl: "/editorial/category-camisetas.webp",
    sourceMode: "category",
    sourceCategoryId: categoryId("camisetas-adulto"),
    sourceCategorySlug: "camisetas-adulto",
    sourceAudience: null,
    isActive: true,
    sortOrder: 3,
    createdAt,
    updatedAt: createdAt,
    productIds: [],
    products: [],
  },
  {
    id: 4,
    slug: "bermudas-adulto",
    title: "Bermudas Adulto",
    subtitle: "Modelagens confortáveis para o calor e para a rotina.",
    imageUrl: "/editorial/category-bermudas.webp",
    sourceMode: "category",
    sourceCategoryId: categoryId("bermudas-adulto"),
    sourceCategorySlug: "bermudas-adulto",
    sourceAudience: null,
    isActive: true,
    sortOrder: 4,
    createdAt,
    updatedAt: createdAt,
    productIds: [],
    products: [],
  },
  {
    id: 5,
    slug: "plus-size",
    title: "Plus Size",
    subtitle: "Camisetas e bermudas na grade G1, G2 e G3.",
    imageUrl: "/editorial/category-plus.webp",
    sourceMode: "audience",
    sourceCategoryId: null,
    sourceCategorySlug: null,
    sourceAudience: "plus",
    isActive: true,
    sortOrder: 5,
    createdAt,
    updatedAt: createdAt,
    productIds: [],
    products: [],
  },
  {
    id: 6,
    slug: "infantil",
    title: "Infantil",
    subtitle: "Do 02 ao 14, para acompanhar cada fase.",
    imageUrl: "/editorial/category-infantil.webp",
    sourceMode: "audience",
    sourceCategoryId: null,
    sourceCategorySlug: null,
    sourceAudience: "infantil",
    isActive: true,
    sortOrder: 6,
    createdAt,
    updatedAt: createdAt,
    productIds: [],
    products: [],
  },
];

export const demoSettings = { ...defaultStoreSettings };
export const demoProducts: ProductSummary[] = [];
