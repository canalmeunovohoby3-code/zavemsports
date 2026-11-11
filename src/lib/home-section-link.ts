import type { HomeSection } from "@/lib/types";

export function getSectionHref(section: HomeSection) {
  if (section.sourceMode === "category" && section.sourceCategorySlug) {
    return `/categoria/${section.sourceCategorySlug}`;
  }
  if (section.sourceMode === "audience" && section.sourceAudience) {
    return `/catalogo?publico=${section.sourceAudience}`;
  }
  return "/catalogo";
}
