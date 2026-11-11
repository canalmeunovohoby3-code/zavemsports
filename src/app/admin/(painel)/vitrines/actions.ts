"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createHomeSection,
  deleteHomeSection,
  getCategoryById,
  getHomeSectionById,
  getProductById,
  moveHomeSection,
  updateHomeSection,
} from "@/lib/queries";
import { isValidImageReference } from "@/lib/uploads";
import { homeSectionSchema, zodFieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";

function revalidateSections() {
  revalidatePath("/");
  revalidatePath("/admin/vitrines");
}

export async function saveHomeSectionAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const sectionIdRaw = String(formData.get("sectionId") ?? "");
  const sectionId = sectionIdRaw ? Number(sectionIdRaw) : null;
  const sourceCategoryRaw = String(formData.get("sourceCategoryId") ?? "");
  const sourceAudienceRaw = String(formData.get("sourceAudience") ?? "");

  let productIds: number[] = [];
  try {
    const parsedIds = JSON.parse(String(formData.get("productIds") ?? "[]"));
    if (!Array.isArray(parsedIds)) throw new Error("invalid");
    productIds = parsedIds.map((value) => Number(value));
  } catch {
    return {
      status: "error",
      message: "Não foi possível ler os produtos selecionados.",
    };
  }

  const parsed = homeSectionSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    sourceMode: String(formData.get("sourceMode") ?? "manual"),
    sourceCategoryId: sourceCategoryRaw ? Number(sourceCategoryRaw) : null,
    sourceAudience: sourceAudienceRaw || null,
    isActive: formData.get("isActive") === "on",
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    productIds,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados da vitrine.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  if (!isValidImageReference(data.imageUrl)) {
    return {
      status: "error",
      message: "Endereço da imagem inválido.",
      fieldErrors: { imageUrl: ["Use upload interno ou URL https."] },
    };
  }

  if (data.sourceMode === "category") {
    if (!data.sourceCategoryId) {
      return {
        status: "error",
        message: "Selecione a categoria usada pela vitrine.",
        fieldErrors: {
          sourceCategoryId: ["Selecione uma categoria."],
        },
      };
    }
    if (!getCategoryById(data.sourceCategoryId)) {
      return {
        status: "error",
        message: "A categoria selecionada não existe.",
        fieldErrors: {
          sourceCategoryId: ["Categoria inválida."],
        },
      };
    }
  }

  if (data.sourceMode === "audience" && !data.sourceAudience) {
    return {
      status: "error",
      message: "Selecione o público usado pela vitrine.",
      fieldErrors: { sourceAudience: ["Selecione um público."] },
    };
  }

  const uniqueProductIds = Array.from(new Set(data.productIds));
  for (const productId of uniqueProductIds) {
    if (!getProductById(productId)) {
      return {
        status: "error",
        message: "Um dos produtos selecionados não existe mais.",
        fieldErrors: {
          productIds: ["Remova o produto inválido e salve novamente."],
        },
      };
    }
  }

  const input = {
    title: data.title,
    subtitle: data.subtitle,
    imageUrl: data.imageUrl,
    sourceMode: data.sourceMode,
    sourceCategoryId:
      data.sourceMode === "category" ? data.sourceCategoryId : null,
    sourceAudience:
      data.sourceMode === "audience" ? data.sourceAudience : null,
    isActive: data.isActive,
    sortOrder: data.sortOrder,
    productIds: uniqueProductIds,
  };

  let savedId: number;
  if (sectionId) {
    const existing = getHomeSectionById(sectionId);
    if (!existing) {
      return { status: "error", message: "Vitrine não encontrada." };
    }
    updateHomeSection(sectionId, input);
    savedId = sectionId;
  } else {
    savedId = createHomeSection(input);
  }

  revalidateSections();
  redirect(
    `/admin/vitrines/${savedId}?ok=${sectionId ? "atualizada" : "criada"}`,
  );
}

export async function deleteHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("sectionId") ?? 0);
  if (!id) return;
  if (!getHomeSectionById(id)) {
    redirect("/admin/vitrines?erro=Vitrine%20n%C3%A3o%20encontrada.");
  }
  deleteHomeSection(id);
  revalidateSections();
  redirect("/admin/vitrines?ok=excluida");
}

export async function moveHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("sectionId") ?? 0);
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) {
    redirect("/admin/vitrines?erro=Movimenta%C3%A7%C3%A3o%20inv%C3%A1lida.");
  }
  const result = moveHomeSection(id, direction);
  if (!result.ok) {
    redirect(
      `/admin/vitrines?erro=${encodeURIComponent(result.error ?? "Não foi possível mover.")}`,
    );
  }
  revalidateSections();
  redirect("/admin/vitrines?ok=ordem");
}

export async function toggleHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("sectionId") ?? 0);
  if (!id) return;
  const section = getHomeSectionById(id);
  if (!section) {
    redirect("/admin/vitrines?erro=Vitrine%20n%C3%A3o%20encontrada.");
  }
  updateHomeSection(id, {
    title: section.title,
    subtitle: section.subtitle,
    imageUrl: section.imageUrl,
    sourceMode: section.sourceMode,
    sourceCategoryId: section.sourceCategoryId,
    sourceAudience: section.sourceAudience,
    isActive: !section.isActive,
    sortOrder: section.sortOrder,
    productIds: section.productIds,
  });
  revalidateSections();
  redirect(`/admin/vitrines?ok=${section.isActive ? "desativada" : "ativada"}`);
}
