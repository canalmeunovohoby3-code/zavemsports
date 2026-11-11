export const editorial = {
  heroBanner: "/bannerprincipal.png",
  heroBannerMobile: "/bannermobile.png",
  institutional: "/editorial/institutional.webp",
  categoryFallbacks: {
    "camisetas-adulto": "/editorial/category-adulto.webp",
    "bermudas-adulto": "/editorial/category-bermudas.webp",
    "camisetas-plus-size": "/editorial/category-plus.webp",
    "bermudas-plus-size": "/editorial/category-plus.webp",
    "camisetas-infantil": "/editorial/category-infantil.webp",
    "bermudas-infantil": "/editorial/kids-feature.webp",
  } as Record<string, string>,
  audienceImages: {
    adulto: "/editorial/category-adulto.webp",
    plus: "/editorial/category-plus.webp",
    infantil: "/editorial/category-infantil.webp",
  } as Record<string, string>,
  typeImages: {
    camiseta: "/editorial/category-camisetas.webp",
    bermuda: "/editorial/category-bermudas.webp",
  } as Record<string, string>,
} as const;

export function getCategoryImage(
  slug: string,
  imageUrl: string,
  fallback?: string,
) {
  return (
    imageUrl ||
    editorial.categoryFallbacks[slug] ||
    fallback ||
    editorial.typeImages.camiseta
  );
}
