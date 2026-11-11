"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/lib/queries";
import { categorySchema, zodFieldErrors } from "@/lib/validation";
import { isValidImageReference } from "@/lib/uploads";
import type { ActionState } from "@/lib/action-state";

export async function saveCategoryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const categoryIdRaw = String(formData.get("categoryId") ?? "");
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    audience: String(formData.get("audience") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    imageUrl,
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados da categoria.",
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  if (!isValidImageReference(parsed.data.imageUrl)) {
    return {
      status: "error",
      message: "Endereço de imagem inválido.",
      fieldErrors: { imageUrl: ["Use upload interno ou URL https."] },
    };
  }

  if (categoryId) {
    const existing = getCategoryById(categoryId);
    if (!existing) {
      return { status: "error", message: "Categoria não encontrada." };
    }
    updateCategory(categoryId, parsed.data);
    revalidatePath("/admin/categorias");
    revalidatePath("/");
    revalidatePath("/catalogo");
    revalidatePath(`/categoria/${existing.slug}`);
    redirect("/admin/categorias?ok=atualizada");
  }

  createCategory(parsed.data);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/catalogo");
  redirect("/admin/categorias?ok=criada");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("categoryId") ?? 0);
  if (!id) return;

  const result = deleteCategory(id);
  if (!result.ok) {
    redirect(
      `/admin/categorias?erro=${encodeURIComponent(result.error ?? "Não foi possível excluir.")}`,
    );
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/catalogo");
  redirect("/admin/categorias?ok=excluida");
}
